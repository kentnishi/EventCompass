import pandas as pd
import re
import emoji
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Load your DataFrame
df = pd.read_csv('Data_cleaned.csv')

multi_word_phrases = ['cedar point', 'ninja creami', 'west side market', 'little italy', 'rock hall',
                      'drone show', 'ceramics class', 'tous les jours', 'paris baguette', 'comedian show',
                      'escape room', 'air fryer', 'food truck', 'spring comedian', 'severance hall',
                      'cuyahoga valley national park','hatch alarm clock', 'free food', 'thwing tuesday',
                      'upbeat spring concert','asian food', 'jewelry making', 'crepes n crisps',
                      'cheesecake factory', 'bombay chaat', 'cilantro taqueria', 'lao szechuan',
                      'lunas bakery', 'sweet spot', 'bubble tea', 'boba tea', 'taiwanese food',
                      'singaporean food', 'thai food', 'mediterranean food', 'middle eastern food',
                      'indian food', 'korean food', 'japanese food', 'blue habanero', 'chipotle mexican',
                      'pacific east', 'koko bakery', 'indian flame', 'citizen pie', 'blue sky brews']

def clean_and_tokenize_with_phrases(text):
    if not isinstance(text, str):
        return []

    # 1. Convert to lowercase
    text = text.lower()
    for phrase in multi_word_phrases:
        standard_token = phrase.replace(' ', '_')
        text = text.replace(phrase, standard_token)
        phrase_no_space = phrase.replace(' ', '')
        text = text.replace(phrase_no_space, standard_token)
    
    text = emoji.replace_emoji(text, replace='')
    text = re.sub(r'[^a-zA-Z0-9_\s]+', ' ', text)
    tokens = word_tokenize(text)
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()
    
    important_words = [
        lemmatizer.lemmatize(word) for word in tokens 
        if word not in stop_words and (word.isalpha() or '_' in word)
    ]
    
    return important_words

text_columns = [col for col in df.columns if col.endswith('_text')]

for col in text_columns:
    df[col] = df[col].apply(clean_and_tokenize_with_phrases)

df.to_csv('Data_cleaned_and_tokenized.csv', index=False)