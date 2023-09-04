from django.shortcuts import render
from django.http import HttpResponse
from .models import SearchResultGoogleNumber
from .models import SearchResultGoogleLink
from .models import Search
import requests

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
            URL_Yandex      = "https://yandex.ru/search/?text="       + str(search)
            URL_Word_Yandex = "https://wordstat.yandex.ru/#!/?words=" + str(search)
            URL_Google      = "https://www.google.com/search?q="      + str(search)
            URL_Yahoo       = "https://search.yahoo.com/search?p="    + str(search)
            URL_Bing        = "https://www.bing.com/search?q="        + str(search)
            URL_Duckduckgo  = "https://duckduckgo.com/?q="            + str(search)
            URL_Ask         = "https://www.ask.com/web?q="            + str(search)
            URL_Archive     = "https://archive.org/search?query="     + str(search) + "&sin = TXT"
            result_yandex = requests.get(URL_Yandex, headers=headers)
            response_yandex = requests.post(URL_Yandex)
            result_word_yandex = requests.get(URL_Word_Yandex, headers=headers)
            response_word_yandex = requests.post(URL_Word_Yandex)
            result_google = requests.get(URL_Google, headers=headers)
            response_google = requests.post(URL_Google)
            result_yahoo = requests.get(URL_Yahoo, headers=headers)
            response_yahoo = requests.post(URL_Yahoo)
            result_bing = requests.get(URL_Bing, headers=headers)
            response_bing = requests.post(URL_Bing)
            response_duckduckgo = requests.post(URL_Duckduckgo)
            result_duckduckgo = requests.get(URL_Duckduckgo, headers=headers)
            response_ask = requests.post(URL_Ask)
            result_ask = requests.get(URL_Ask, headers=headers)
            response_archive = requests.post(URL_Archive)
            result_archive = requests.get(URL_Archive, headers=headers)

            ###print(soup.prettify())
            ### Google
            soup = BeautifulSoup(result_google.content, 'html.parser')
            total_results_text_google = soup.find("div", {"id": "result-stats"}).find(string=True, recursive=False)
            results_num_google = int("".join([num for num in total_results_text_google if num.isdigit()]))
            ### Yahooo
            soup = BeautifulSoup(result_yahoo.content, 'html.parser')
            total_results_text_yahoo = soup.find("span", {"class": "fz-14 lh-22"}).find(string=True, recursive=False)
            results_num_yahoo = int("".join([num for num in total_results_text_yahoo if num.isdigit()]))
            ### Bing
            try:
                   soup = BeautifulSoup(result_bing.content, 'html.parser')
                   total_results_text_bing = soup.find("span", {"class": "sb_count"}).find(string=True, recursive=False)
                   results_num_bing = int("".join([num for num in total_results_text_bing if num.isdigit()]))
            except:
                   results_num_bing = int(0)
            ### Ask
            try:
                    soup = BeautifulSoup(result_ask.content, 'html.parser')
                    total_results_text_ask = soup.find("div", {"class": "PartialResultsHeader-summary"}).find(string=True,recursive=False)
                    results_num_ask = int("".join([num for num in total_results_text_ask if num.isdigit()][4:]))
            except:
                    results_num_ask = int(0)

            results_num_total = str(results_num_google + results_num_yahoo + results_num_bing + results_num_ask)
            results_response_total = str((  response_yandex.elapsed.total_seconds()
                                          + response_word_yandex.elapsed.total_seconds()
                                          + response_google.elapsed.total_seconds()
                                          + response_yahoo.elapsed.total_seconds()
                                          + response_bing.elapsed.total_seconds()
                                          + response_duckduckgo.elapsed.total_seconds()
                                          + response_ask.elapsed.total_seconds()
                                          + response_archive.elapsed.total_seconds())
                                           /8)

            SearchResultGoogleNumber.objects.all().delete()
            SearchResultGoogleLink.objects.all().delete()

            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Yandex,
                SearchResultGoogleLinksNumber = 100,
                SearchResultGoogleLinksNumberResponse = 1
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Word_Yandex,
                SearchResultGoogleLinksNumber = 101,
                SearchResultGoogleLinksNumberResponse = 2
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Google,
                SearchResultGoogleLinksNumber = 102,
                SearchResultGoogleLinksNumberResponse = 3
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Yahoo,
                SearchResultGoogleLinksNumber = 103,
                SearchResultGoogleLinksNumberResponse = 4
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Bing,
                SearchResultGoogleLinksNumber = 104,
                SearchResultGoogleLinksNumberResponse = 5
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Duckduckgo,
                SearchResultGoogleLinksNumber = 105,
                SearchResultGoogleLinksNumberResponse = 6
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Ask,
                SearchResultGoogleLinksNumber = 106,
                SearchResultGoogleLinksNumberResponse = 7
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Archive,
                SearchResultGoogleLinksNumber = 107,
                SearchResultGoogleLinksNumberResponse = 8
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