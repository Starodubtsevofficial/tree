from django.shortcuts import render
from django.http import HttpResponse
from .models import SearchResultGoogleNumber
from .models import SearchResultGoogleLink
from .models import Search
import requests
import sqlite3
from sqlite3 import Error
from bs4 import BeautifulSoup
from .forms import SearchForm

def index(request):
    SearchWorkNumber = SearchResultGoogleNumber.objects.all()
    SearchWorkLinks = SearchResultGoogleLink.objects.all()
    SearchWorkNumberOfSearch = Search.objects.all()
    error = ''
    if request.method == 'POST':
        form = SearchForm(request.POST)
        if form.is_valid():
            form.save()
            SearchWorkNumberOfSearch = Search.objects.all()
            last_request = SearchWorkNumberOfSearch[len(SearchWorkNumberOfSearch)-1]
            search =  last_request
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"}
            URL_Google = "https://www.google.com/search?q=" + str(search)
            URL_Yandex = "https://yandex.ru/search/?text=" + str(search)
            URL_Yahoo  = "https://search.yahoo.com/search?p=" + str(search)
            URL_Bing   = "https://www.bing.com/search?q=" + str(search)
            result_google = requests.get(URL_Google, headers=headers)
            response_google = requests.post(URL_Google)
            result_yandex = requests.get(URL_Yandex, headers=headers)
            response_yandex = requests.post(URL_Yandex)
            result_yahoo = requests.get(URL_Yahoo, headers=headers)
            response_yahoo = requests.post(URL_Yahoo)
            result_bing = requests.get(URL_Bing, headers=headers)
            response_bing = requests.post(URL_Bing)
            ###print(soup.prettify())
            soup = BeautifulSoup(result_google.content, 'html.parser')
            total_results_text = soup.find("div", {"id": "result-stats"}).find(string=True, recursive=False)
            results_num_google = int("".join([num for num in total_results_text if num.isdigit()]))

            soup = BeautifulSoup(result_yahoo.content, 'html.parser')
            total_results_text = soup.find("span", {"class": "fz-14 lh-22"}).find(string=True, recursive=False)
            results_num_yahoo = int("".join([num for num in total_results_text if num.isdigit()]))

            soup = BeautifulSoup(result_bing.content, 'html.parser')
            total_results_text = soup.find("span", {"class": "sb_count"}).find(string=True, recursive=False)
            results_num_bing = int("".join([num for num in total_results_text if num.isdigit()]))

            results_num_total = str(results_num_google + results_num_yahoo + results_num_bing)
            results_response_total = (response_google.elapsed.total_seconds() + response_yahoo.elapsed.total_seconds() + response_bing.elapsed.total_seconds() + response_yandex.elapsed.total_seconds())

            SearchResultGoogleNumber.objects.all().delete()
            SearchResultGoogleLink.objects.all().delete()

            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Google,
                SearchResultGoogleLinksNumber = 100,
                SearchResultGoogleLinksNumberResponse = 1
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Yandex,
                SearchResultGoogleLinksNumber = 101,
                SearchResultGoogleLinksNumberResponse = 2
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Yahoo,
                SearchResultGoogleLinksNumber = 102,
                SearchResultGoogleLinksNumberResponse = 3
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Bing,
                SearchResultGoogleLinksNumber = 103,
                SearchResultGoogleLinksNumberResponse = 4
            )
            SearchResultGoogleNumber.objects.create(
                SearchResultGoogleNumbers = results_num_total,
                SearchResultGoogleSearchTime = results_response_total
            )


        else: 
            error = 'Error'

    form = SearchForm()

    context = {
        'SearchResultGoogleNumbers': SearchWorkNumber, 
        'SearchResultGoogleSearchTime': SearchWorkNumber, 
        'SearchResultGoogleLinks': SearchWorkLinks, 
        'SearchNumber': SearchWorkNumberOfSearch, 
        'SearchResultGoogleLinksNumberResponse': SearchWorkLinks, 
        'form': form}

    return render(request, 'main/index.html', context)

def about(request):
    return render(request, 'main/about.html', {'form': SearchForm})