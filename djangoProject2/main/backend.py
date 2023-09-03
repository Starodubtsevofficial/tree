import requests
import sqlite3
from bs4 import BeautifulSoup

###Выгрузка запроса
def read_sqlite_table():
    try:
        sqlite_connection = sqlite3.connect('../db.sqlite3')
        cursor = sqlite_connection.cursor()
        print("Подключен к SQLite для выгрузки строки")
        sqlite_select_query = "SELECT id, GetSearch, SearchNumber from main_search ms  where id = (select max(id) from main_search)"
        cursor.execute(sqlite_select_query)
        records = cursor.fetchall()
        for row in records:
            row[0],
            row[1],
            row[2]

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
print("Запрос:", GetSearch)


### Формирование поискового запроса
search =  GetSearch
headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"}
URL     = "https://www.google.com/search?q=" + search
print("Ссылка:", URL)
result = requests.get(URL, headers=headers)

### Получение отклика запроса
response = requests.post(URL)
print("Вермя запроса:", response.elapsed.total_seconds())


### Получение result-stats из Google
soup = BeautifulSoup(result.content, 'html.parser')
total_results_text = soup.find("div", {"id": "result-stats"}).find(string=True, recursive=False)
results_num = ''.join([num for num in total_results_text if num.isdigit()])
print("Количество запросов:", results_num)

### Обновление ссылки в БД
def update_sqlite_table():
    try:
        sqlite_connection = sqlite3.connect('../db.sqlite3')
        cursor = sqlite_connection.cursor()
        print("Подключен к SQLite для обновления ссылки")
        data = URL
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

### Обновление количества запросов и времени
def update_sqlite_table_result():
    try:
        sqlite_connection = sqlite3.connect('../db.sqlite3')
        cursor = sqlite_connection.cursor()
        print("Подключен к SQLite для обновления количества и вермени запросоа")
        data = results_num
        sql_update_query = "UPDATE main_searchresultgooglenumber SET SearchResultGoogleNumbers=?, SearchResultGoogleSearchTime=? WHERE id=1;"
        cursor.execute(sql_update_query, (data, response.elapsed.total_seconds()))
        sqlite_connection.commit()
        print("Запись успешно обновлена в таблице main_searchresultgooglenumber ", cursor.rowcount)
        cursor.close()

    except sqlite3.Error as error:
        print("Ошибка при работе с SQLite", error)
    finally:
        if sqlite_connection:
            sqlite_connection.close()
            print("Соединение с SQLite закрыто")
update_sqlite_table_result()

