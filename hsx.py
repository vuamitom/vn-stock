import requests
import csv

def getCompanyData():
    companies = []
    url = 'https://www.hsx.vn/Modules/Listed/Web/SymbolList'
    params = {
        'pageFieldName1': 'Code',
        'pageFieldValue1': '',
        'pageFieldOperator1': 'eq',
        'pageFieldName2': 'Sectors',
        'pageFieldValue2': '',
        'pageFieldOperator2': '',
        'pageFieldName3': 'Sector',
        'pageFieldValue3': '00000000-0000-0000-0000-000000000000',
        'pageFieldOperator3': '',
        'pageFieldName4': 'StartWith',
        'pageFieldValue4': '',
        'pageFieldOperator4': '',
        'pageCriteriaLength': '4',
        '_search': 'false',
        'nd': '1710340753478',
        'rows': '30',
        'page': '1',
        'sidx': 'id',
        'sord': 'desc'
    }
    headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
    }
    
    page = 1
    while True:
        print ('request ', page)
        params['page'] = str(page)
        response = requests.get(url, params=params, headers=headers)
        data = response.json()
        # Process the data as needed
        # ...
        print(data)
        if not data['rows']:
            break
        for row in data['rows']:
            companies.append(row['cell'])
        page += 1
    return companies

if __name__ == '__main__':
    companies = getCompanyData()
    headers = ['Code', 'ISIN', 'FIGI', 'Name', 'Volume', 'Circulation', 'Date']
    # write companies to csv with headers 
    with open('companies.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(companies)