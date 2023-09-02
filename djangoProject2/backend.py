import requests
import sqlite3
from sqlite3 import Error
from bs4 import BeautifulSoup
def read_sqlite_table():
    try:
        sqlite_connection = sqlite3.connect('db.sqlite3')
        cursor = sqlite_connection.cursor()
        print("Подключен к SQLite для выгрузки строки")

        sqlite_select_query = "SELECT id, GetSearch, SearchNumber from main_search ms  where id = (select max(id) from main_search)"
        cursor.execute(sqlite_select_query)
        records = cursor.fetchall()
        print("Вывод каждой строки")
        for row in records:
            print("id:", row[0]),
            print("GetSearch:", row[1]),
            print("SearchNumber:", row[2], end="\n\n")

        cursor.close()
    except sqlite3.Error as error:
             print("Ошибка при работе с SQLite", error)
    finally:
        if sqlite_connection:
             sqlite_connection.close()
             print("Соединение с SQLite закрыто")
    return row[1]
read_sqlite_table()
GetSearch = read_sqlite_table()
print(GetSearch)


#
#
search =  GetSearch
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"}
URL     = "https://www.google.com/search?q=" + search
print(URL)
result = requests.get(URL, headers=headers)

soup = BeautifulSoup(result.content, 'html.parser')

total_results_text = soup.find("div", {"id": "result-stats"}).find(string=True, recursive=False)
results_num = ''.join([num for num in total_results_text if num.isdigit()])
print(results_num)

def update_sqlite_table():
    try:
        sqlite_connection = sqlite3.connect('db.sqlite3')
        cursor = sqlite_connection.cursor()
        print("Подключен к SQLite для обновления ссылки")
        data = URL
        print(URL)
        sql_update_query = "UPDATE main_searchresultgooglelink SET SearchResultGoogleLinks=? WHERE id=?;"
        cursor.execute(sql_update_query, (data, 1))
        sqlite_connection.commit()
        print("Запись успешно обновлена в таблице main_searchresultgooglelink ", cursor.rowcount)
        cursor.close()

    except sqlite3.Error as error:
        print("Ошибка при работе с SQLite", error)
    finally:
        if sqlite_connection:
            sqlite_connection.close()
            print("Соединение с SQLite закрыто")
update_sqlite_table()

