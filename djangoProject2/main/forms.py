from .models import Search
from django.forms import ModelForm, TextInput


class SearchForm(ModelForm):
    class Meta:
        model = Search
        fields = ['GetSearch']

        widgets = {
            "GetSearch": TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Поиск'
            })
        }