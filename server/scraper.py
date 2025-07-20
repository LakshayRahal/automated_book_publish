import requests
from bs4 import BeautifulSoup

def scrap(ul):
    re = requests.get(ul, timeout=10)
    # use of BeautifulSoup to make html parser
    sp = BeautifulSoup(re.text, 'html.parser')
    # maded a div for finding content 
    div = sp.find('div', class_='mw-parser-output')

#    all things included whther it is 
    for t in div.find_all(['style','sup', 'table', 'script']):
        t.decompose()

    tl = div.get_text(separator="\n", strip=True)
    # returninig 
    return tl, None
