from dataclasses import dataclass
from flask import Flask
from pymongo import collection
import requests
import re
from bs4 import BeautifulSoup
import threading
import datetime
from urllib.parse import urljoin
from urllib.parse import urlparse
#import mysql.connector
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os
import subprocess
import sys

@dataclass
class CrawledPage:
    url: str
    time: float
    title: str
    outgoing_links: list[str]

REQUEST_TIMEOUT = 5
def get_html(html_url):
    header = {'User-Agent':'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36'}
    try:
        html = requests.get(html_url,headers = header,timeout=REQUEST_TIMEOUT)
    except requests.Timeout:
        return None
    return html.text


def get_links_to_crawl(current_url, html_doc, condition):
    soup = BeautifulSoup(html_doc, 'html.parser')
    links = soup.find_all("a", href=re.compile(condition))
    for link in links:
        if not link['href'].startswith("javascript:"):
            
            yield normalize_url(current_url, link['href'])

def get_title(html_doc):
    soup = BeautifulSoup(html_doc, 'html.parser')
    title = soup.find("title")
    if title is not None:
        return soup.find("title").text
    return None

def normalize_url(base, url):
    link = urljoin(base, url)
    link = urlparse(link)
    return link._replace(params="", query="", fragment="").geturl()


def crawl_links(links, crawled_links):
    for link in links:
        if link not in crawled_links:
            html_doc = get_html(link)
            if html_doc is None:
                continue
            crawled_time = datetime.datetime.now()
            links_to_crawl = get_links_to_crawl(link, html_doc, condition)
            crawled_page = CrawledPage(url=link, time=crawled_time, title=get_title(html_doc), outgoing_links=list(links_to_crawl))
            crawled_links.add(link)
            yield crawled_page

def crawl_all_links(depth, start_link):
    crawled_links = set()
    all_links_to_crawl = [[CrawledPage(url=None, time=None, title=None, outgoing_links=[start_link])]]
    for i in range(depth):
        links_to_crawl = []
        for page in all_links_to_crawl[i]:
            #print(i)
            #print(from_link)
            crawled_links_on_page = crawl_links(page.outgoing_links,crawled_links)
            for crawled_link_on_page in crawled_links_on_page:
                links_to_crawl.append(crawled_link_on_page)
                yield crawled_link_on_page
        all_links_to_crawl.append(links_to_crawl)

def get_links(crawled_output_links):
    links = []
    for link in crawled_output_links:
        links.append(link.url)
    return links

org_link = "https://webik.ms.mff.cuni.cz/nswi153/"
condition = ""

app = Flask(__name__)

def add_page(mycursor, crawled_page):
    sql = "INSERT INTO Crawled_Page (url, time, title) VALUES (%s, %s, %s)"
    val = (crawled_page.url, crawled_page.time, crawled_page.title)
    mycursor.execute(sql, val)
    
def update_page(mycursor, crawled_page):
    sql = "UPDATE Crawled_Page SET url=%s, time=%s, title=%s WHERE url=%s"
    val = (crawled_page.url, crawled_page.time, crawled_page.title, crawled_page.url)
    mycursor.execute(sql, val)

def get_all_pages(mycursor):
    sql = "SELECT * FROM Crawled_Page"
    mycursor.execute(sql)
    myresult = mycursor.fetchall()
    return myresult

def crawled_page_to_mongo_object(crawled_page):
    return {"url": crawled_page.url, "time": crawled_page.time, "title": crawled_page.title}

def add_page_to_mongodb(collection, crawled_page):
    data = crawled_page_to_mongo_object(crawled_page)
    collection.insert_one(data)

def update_page_to_mongodb(collection, crawled_page):
    filter_query = {"url": crawled_page.url}
    update_query = {"$set":crawled_page_to_mongo_object(crawled_page)}
    collection.update_one(filter_query, update_query)

def is_in_mongodb_table(collection, crawled_page):
    query = {"url": crawled_page.url}
    return collection.find_one(query)

def add_outgoing_links(mycursor, crawled_page):
    sql = "INSERT INTO Outgoing_link (from_id, url) VALUES (%s, %s)"
    id_ = get_id(mycursor,crawled_page)
    for link in crawled_page.outgoing_links:
        val = (id_, link)
        mycursor.execute(sql, val)

def add_outgoing_links_to_mongodb(outgoing_links_collection, crawled_page_collection, crawled_page):
    # Get the id of the crawled_page
    page_id = get_id_from_mongodb(crawled_page_collection, crawled_page)
    if page_id:
        # Insert outgoing links with the from_id matching the crawled_page id
        outgoing_links = [{"from_id": page_id, "url": link} for link in crawled_page.outgoing_links]
        if outgoing_links:
            outgoing_links_collection.insert_many(outgoing_links)
    else:
        print("Page not found")

def delete_outgoing_links(mycursor, crawled_page):
    id_ = get_id(mycursor,crawled_page)
    sql = "DELETE FROM Outgoing_link WHERE from_id=%s"
    val = (id_,)
    mycursor.execute(sql, val)

def delete_outgoing_links_from_mongodb(outgoing_links_collection, crawled_page_collection, crawled_page):
    # Get the id of the crawled_page
    page_id = get_id_from_mongodb(crawled_page_collection, crawled_page)
    if page_id:
        # Delete outgoing links with the from_id matching the crawled_page id
        query = {"from_id": page_id}
        outgoing_links_collection.delete_many(query)
    else:
        print("Page not found")

def get_id(mycursor, crawled_page):
    sql = "SELECT id FROM Crawled_Page WHERE url=%s"
    val = (crawled_page.url,)
    mycursor.execute(sql, val)
    myresult = mycursor.fetchall()
    return myresult[0][0]

def get_id_from_mongodb(collection, crawled_page):
    query = {"url": crawled_page.url}
    result = collection.find_one(query, {"_id": 1})  # Only return the _id field
    if result:
        return str(result["_id"])
    return None


def is_in_table(mycursor, crawled_page):
    sql = "SELECT count(*) FROM Crawled_Page WHERE url=%s"
    val = (crawled_page.url,)
    mycursor.execute(sql, val)
    myresult = mycursor.fetchall()
    return myresult[0][0] > 0

def main(mode):

    load_dotenv()
    html_doc = get_html(org_link)
    crawled_start_urls = get_links_to_crawl(org_link, html_doc, condition)
    #mycursor = mydb.cursor()
    depth = os.getenv('DEPTH')
    pages = crawl_all_links(int(depth),org_link)
    #uri = "mongodb+srv://w1509517798:T1509517798w@cluster0.lnmxp7l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

    # Create a new client and connect to the server
    #client = MongoClient(uri, server_api=ServerApi('1'))
    # 加载 .env 文件
    

    # 从环境变量获取 MongoDB URI
    mongo_uri = os.getenv('MONGODB_URI')
    period_time = int(os.getenv('PERIOD_TIME'))
    # 连接到 MongoDB
    client = MongoClient(mongo_uri)

    db = client["test"]
    collection = db.pages
    outgoing_link_collection = db.outgoing_links
    for page in pages:
        
        if is_in_mongodb_table(collection, page):
            #update_page(mycursor, page)
            update_page_to_mongodb(collection, page)
        else:
            #add_page(mycursor, page)
            add_page_to_mongodb(collection, page)
        
        #delete_outgoing_links(mycursor, page)
        #add_outgoing_links(mycursor, page)
        delete_outgoing_links_from_mongodb(outgoing_link_collection, collection, page)
        add_outgoing_links_to_mongodb(outgoing_link_collection, collection, page)
        print(page)
    #mydb.commit()
    #mydb.close()
    print("-------------------------------------------------------------------------------------");
    if mode == "--active":
        threading.Timer(period_time, main).start()
    else:
        sys.exit(0)


def run_flask():
    app.run(port=8080)

def run_crawler(mode):
    main(mode)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Please enter mode: --active --inactive")
    else:
        if sys.argv[1] == "--active":
            load_dotenv()
            server_path = os.getenv('SERVER_PATH')
            command = "pm2 start " + server_path + "app.js --watch --restart-delay 60000"
            subprocess.run(command, shell=True)
            flask_thread = threading.Thread(target=run_flask)
            crawler_thread = threading.Thread(target=run_crawler, args=("--active",))
            flask_thread.start()
            crawler_thread.start()
        elif sys.argv[1] == "--inactive":
            load_dotenv()
            server_path = os.getenv('SERVER_PATH')
            command = "pm2 start " + server_path + "app.js --watch --restart-delay 60000"
            subprocess.run(command, shell=True)
            #flask_thread = threading.Thread(target=run_flask)
            #crawler_thread = threading.Thread(target=run_crawler, args=("--inactive",))
            #flask_thread.start()
            #crawler_thread.start()
            #run_flask()
            run_crawler("--inactive")
        else:
            print("Wrong parameter. Please enter --active or --inactive")
        
