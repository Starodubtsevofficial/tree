# Generated by Django 4.2.4 on 2023-09-01 18:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_searchresultgooglelink_searchresultgooglelinksnumberresponse_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='search',
            name='GetSearch',
            field=models.CharField(max_length=100, verbose_name='Поисковой запрос'),
        ),
    ]
