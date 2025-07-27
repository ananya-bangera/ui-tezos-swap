# Load coins.json (reference with correct symbols)
with open('./coins.json', 'r', encoding='utf-8') as f:
    coins_data = json.load(f)
