import requests
from bs4 import BeautifulSoup

def scrape_chapter(url):
    response = requests.get(url, timeout=10)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch page. Status: {response.status_code}")

    soup = BeautifulSoup(response.text, 'html.parser')
    content_div = soup.find('div', class_='mw-parser-output')

    if not content_div:
        raise Exception("Main content section not found.")

    for tag in content_div.find_all(['sup', 'table', 'style', 'script', 'img']):
        tag.decompose()

    full_text = content_div.get_text(separator="\n", strip=True)
    return full_text, None
