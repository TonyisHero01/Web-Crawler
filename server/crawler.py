import datetime
import re
import _thread
import sys
import time
import pymongo
import requests
import config

org_link = sys.argv[1]

depth = int(sys.argv[2])

index = 1

header = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36'}

timeout = 5

def get_title(text):
    res = re.search('<title>(?P<title>.*)</title>', text)
    return res.groupdict().get('title') if res else 'unknown'


def get_links(text):
    res = re.findall('<a .*?href="(?P<title>https.*?)".*?>.*?</a>', text)
    return res


def add_db(data):
    client = pymongo.MongoClient(config.url)
    mydb = client["db"]
    col = mydb["db"]

    url = data.get('url')

    myquery = {"url": url}

    col.delete_many(myquery)

    return col.insert_one(data).inserted_id


def get_info(url, _depth, _from=None):
    if _depth > depth:
        return
    try:
        r = requests.get(url, header, timeout=timeout)
    except Exception as e:
        try:
            add_db({
                "from": _from,
                "url": url,
                "title": "unknown",
                "links": [],
                "time": str(datetime.datetime.now())
            })
        except Exception as e:
            print(e.args)
    else:
        _id = add_db({
            "from": _from,
            "url": url,
            "title": get_title(r.text),
            "links": get_links(r.text),
            "time": str(datetime.datetime.now())
        })
        links = get_links(r.text)
        for link in links:
            _thread.start_new_thread(get_info, (link, _depth + 1, _id))


if __name__ == "__main__":
    try:
        _thread.start_new_thread(get_info, (org_link, 1))
    except Exception as e:
        print(e.args)

    while True:
        time.sleep(60)
        break
