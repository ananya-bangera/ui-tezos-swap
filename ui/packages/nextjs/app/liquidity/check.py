import json

# Load coins.json (reference with correct symbols)
with open('./coins.json', 'r', encoding='utf-8') as f:
    coins_data = json.load(f)

# Prepare a mapping from name to symbol for quick lookup
name_to_symbol = {}
for coin in coins_data:
    coin_name = coin.get('name', '').strip().upper()
    coin_symbol = coin.get('symbol', '').strip().upper()
    if coin_name and coin_symbol:
        name_to_symbol[coin_name] = coin_symbol

# Load token.json (to be corrected)
with open('./token.json', 'r', encoding='utf-8') as f:
    tokens_data = json.load(f)

# Assuming tokens_data['tokens'] holds list of token dictionaries
tokens = tokens_data.get('tokens', [])

# Update token symbols using the mapping
for token in tokens:
    token_name = token.get('name', '').strip()
    if token_name in name_to_symbol:
        correct_symbol = name_to_symbol[token_name.upper()]
        # Only update if different from current one
        if token.get('symbol', '') != correct_symbol:
            token['symbol'] = correct_symbol

# Save the corrected tokens data to output.json
with open('output.json', 'w', encoding='utf-8') as f:
    json.dump(tokens_data, f, ensure_ascii=False, indent=4)

print("Updated token.json with corrected symbols saved as output.json.")
