import requests
from bs4 import BeautifulSoup

def scrap(url):
    re = requests.get(url, timeout=10)
    if re.status_code != 200:
        raise Exception(f"Failed to fetch page. Status: {re.status_code}")

    soup = BeautifulSoup(re.text, 'html.parser')
    div = soup.find('div', class_='mw-parser-output')

    if not div:
        raise Exception("Main content not found.")

    for tag in div.find_all(['sup', 'table', 'style', 'script', 'img']):
        tag.decompose()

    total = div.get_text(separator="\n", strip=True)
    return total, None
