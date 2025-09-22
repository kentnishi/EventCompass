import re
from typing import Optional, Set, List, Dict, Any
import numpy as np
import pandas as pd
import emoji

RECAPTCHA_MIN = 0.30
MIN_DURATION_SECS = 10  

DROP_COLS = {
    "Status", "IPAddress", "Progress", "Duration (in seconds)", "Finished",
    "RecordedDate", "ResponseId", "RecipientLastName", "RecipientFirstName",
    "RecipientEmail", "ExternalDataReference", "LocationLatitude",
    "LocationLongitude", "DistributionChannel", "UserLanguage",
    "QID47_Browser", "QID47_Version", "QID47_Operating System",
    "QID47_Resolution", "QID48", "Q_DuplicateRespondent", "StartDate", "EndDate", "Q_RecaptchaScore", 
    "QID48", "Q_BallotBoxStuffing", "QID47_Operating System",
    "Q_StraightliningQuestions", "Q_StraightliningPercentage", "Q_StraightliningCount"
}

# -------   Helper Functions ----------------
def slugify(text: str) -> str:
    if pd.isna(text):
        return ""
    t = re.sub(r"\s+", " ", str(text)).strip()
    t = re.sub(r"[^\w\s-]", "", t)
    t = t.lower().replace(" ", "_")
    t = re.sub(r"_+", "_", t)
    return t[:60].strip("_")

def make_short_name(orig: str, import_id: Optional[str], label: Optional[str], used: Set[str]) -> str:
    cand = None
    if isinstance(import_id, str) and import_id and "ImportId" not in import_id:
        cand = slugify(import_id)
    if not cand:
        cand = slugify(label) if isinstance(label, str) and label else slugify(orig)
    base = cand or slugify(orig)
    name = base
    i = 2
    while name in used or name == "":
        name = f"{base}_{i}"
        i += 1
    used.add(name)
    return name

def build_dictionary_and_rename(raw: pd.DataFrame) -> (pd.DataFrame, pd.DataFrame):
    df = raw.iloc[2:].reset_index(drop=True)
    labels_row = raw.iloc[0]
    importid_row = raw.iloc[1]
    used: Set[str] = set()
    mapping: List[Dict[str, Any]] = []
    new_cols: List[str] = []
    for orig_col in df.columns:
        label = labels_row.get(orig_col, np.nan)
        val = importid_row.get(orig_col, np.nan)
        import_id = None
        if isinstance(val, str) and "ImportId" in val:
            m = re.search(r'"ImportId"\s*:\s*"([^"]+)"', val)
            import_id = m.group(1) if m else None
        elif isinstance(val, str) and val and "ImportId" not in val:
            import_id = val
        short = make_short_name(orig_col, import_id, label, used)
        mapping.append({
            "original_column": orig_col,
            "short_name": short,
            "question_label": label,
            "import_id": import_id
        })
        new_cols.append(short)
    df.columns = new_cols
    data_dict = pd.DataFrame(mapping)
    return df, data_dict

def get_col(df: pd.DataFrame, *candidates: str) -> Optional[str]:
    """Return the first existing column name among candidates, checking
       exact, lower, and slugified forms (post-rename safety)."""
    cols = set(df.columns)
    lowers = {c.lower(): c for c in df.columns}
    for c in candidates:
        if c in cols:
            return c
        if c.lower() in lowers:
            return lowers[c.lower()]
        s = slugify(c)
        if s in cols:
            return s
    return None

def maybe_numeric(series: pd.Series, thresh: float = 0.6) -> bool:
    s = series.dropna().astype(str).str.strip()
    if len(s) == 0:
        return False
    numeric_like = s.str.match(r"^-?\d+(\.\d+)?$").mean()
    return float(numeric_like) >= thresh

def clean_special_characters(text):
    if isinstance(text, str):
        text = emoji.replace_emoji(text, replace='')
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
        return text
    else:
        return text
# -----------------------

raw = pd.read_csv("Data.csv", low_memory=False)

df, data_dict = build_dictionary_and_rename(raw)
print(f"[rename] columns mapped. preview:\n{data_dict.head(5)}\n")

if "qid48_text" in df.columns:
    col = "qid48_text"
    before = len(df)
    df[col] = df[col].astype(str).str.lower().str.strip()
    df = df.drop_duplicates(subset=[col], keep="first")
    after = len(df)
    print(f"Dropped {before - after} duplicate responses based on normalized {col}")

if "q_duplicaterespondent" in df.columns:
    col = "q_duplicaterespondent"
    before = len(df)
    df = df[df[col] != True]
    after = len(df)
    print(f"Dropped {before - after} rows flagged as duplicate respondents")

if "status" in df.columns:
    before = len(df)
    df = df[df["status"] != "Survey Preview"]
    print(f"Removed {before - len(df)} preview rows")

if "q_recaptchascore" in df.columns:
    df["q_recaptchascore"] = pd.to_numeric(df["q_recaptchascore"], errors="coerce")
    before = len(df)
    df = df[df["q_recaptchascore"].fillna(1.0) >= 0.3]
    print(f"Dropped {before - len(df)} rows with low reCAPTCHA score (<0.3)")

start_col = get_col(df, "StartDate")
end_col = get_col(df, "EndDate")
rec_col = get_col(df, "RecordedDate")

for c in [start_col, end_col, rec_col]:
    if c is not None:
        df[c] = pd.to_datetime(df[c], errors="coerce")

if start_col and end_col:
    df["duration_secs"] = (df[end_col] - df[start_col]).dt.total_seconds()
    before = len(df)
    df = df[(df["duration_secs"].isna()) | (df["duration_secs"] >= MIN_DURATION_SECS)]
    print(f"[quality] dropped {before - len(df)} rows with duration < {MIN_DURATION_SECS}s")

targets = set()
for c in DROP_COLS:
    for cand in (c, slugify(c), c.lower()):
        targets.add(cand)

drop_list = [col for col in df.columns if (col in targets or col.lower() in targets)]
df = df.drop(columns=drop_list, errors="ignore")
print(f"[drop] dropped columns: {sorted(set(drop_list))}")

num_converted = []
for col in df.columns:
    if df[col].dtype == "object" and maybe_numeric(df[col]):
        df[col] = pd.to_numeric(df[col], errors="coerce")
        num_converted.append(col)
if num_converted:
    print(f"[types] coerced to numeric: {num_converted[:12]}{' ...' if len(num_converted)>12 else ''}")

text_columns = [col for col in df.columns if col.endswith('_text')]
for col in text_columns:
    df[col] = df[col].apply(clean_special_characters)

df = df.iloc[:, 4:]
df.reset_index(inplace=True)
data_dict = data_dict.iloc[25:]

df.to_csv('Data_cleaned.csv', index=False)
data_dict.to_csv('Data_dictionary.csv', index=False)