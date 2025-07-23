import datetime
import os
import re
import sys
from dotenv import load_dotenv
import psycopg2
import requests
from urllib.parse import urljoin

DEFAULT_TIMEOUT = 5
USER_AGENT_HEADER = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36'
}

visited = set()

load_dotenv()

def get_db_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS")
    )


def parse_arguments():
    if len(sys.argv) < 5:
        print("Usage: python crawler.py <url> <depth> <regex_pattern> <execution_id>")
        sys.exit(1)
    return sys.argv[1], int(sys.argv[2]), sys.argv[3], int(sys.argv[4])


def extract_title(html):
    match = re.search(r'<title>(?P<title>.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    return match.group('title').strip() if match else "unknown"


def extract_links(html, base_url, pattern):
    matches = re.findall(r'href=["\'](.*?)["\']', html)
    result = set()
    for link in matches:
        absolute = urljoin(base_url, link)
        if re.match(pattern, absolute):
            result.add(absolute)
    return list(result)


def insert_page_to_db(data, execution_id):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO pages (execution_id, url, title, from_id, time, links)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            execution_id,
            data["url"],
            data["title"],
            data["from_id"],
            data["time"],
            data["links"]
        ))
        page_id = cursor.fetchone()[0]
        conn.commit()
        print(f"[INSERTED] {data['url']} → id={page_id} (exec_id={execution_id})")
        return page_id
    except Exception as e:
        print("[DB ERROR]", e)
        return None
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass


def crawl(url, current_depth, max_depth, pattern, execution_id, from_id=None):
    if current_depth > max_depth or url in visited:
        return
    visited.add(url)
    print(f"[CRAWL] → URL: {url}, depth: {current_depth}/{max_depth}, exec_id: {execution_id}, from_id: {from_id}")
    try:
        resp = requests.get(url, headers=USER_AGENT_HEADER, timeout=DEFAULT_TIMEOUT)
        html = resp.text
    except Exception as e:
        print("[REQUEST FAILED]", url, e)
        insert_page_to_db({
            "url": url,
            "title": "unknown",
            "links": [],
            "from_id": from_id,
            "time": datetime.datetime.utcnow()
        }, execution_id)
        return

    title = extract_title(html)
    links = extract_links(html, url, pattern)
    print(f"[FOUND LINKS] {len(links)} links from {url}")

    this_id = insert_page_to_db({
        "url": url,
        "title": title,
        "links": links,
        "from_id": from_id,
        "time": datetime.datetime.utcnow()
    }, execution_id)

    for link in links:
        crawl(link, current_depth + 1, max_depth, pattern, execution_id, this_id)


def main():
    url, depth, pattern, exec_id = parse_arguments()
    print(f">>> Starting crawler: {url}, depth={depth}, pattern={pattern}, execution_id={exec_id}\n")
    crawl(url, 1, depth, pattern, exec_id)
    print("✅ Crawler finished.\n")


if __name__ == "__main__":
    main()