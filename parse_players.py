import csv
import json
import re

def convert_gdrive_url(url):
    if not url or "drive.google.com" not in url:
        return url
    # Extract file ID from drive.google.com/open?id=... or drive.google.com/file/d/...
    match = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', url)
    if not match:
        match = re.search(r'/file/d/([a-zA-Z0-9_-]+)', url)
    
    if match:
        file_id = match.group(1)
        return f"https://drive.google.com/thumbnail?id={file_id}&sz=w1000"
    return url

players = []
with open('c:/D_drive/RPL-Auction/Form Responses 1.csv', 'r', encoding='utf-8') as f:
    # Custom parsing to handle the multi-line header
    lines = f.readlines()
    # Header is lines[0] and lines[1]. Data starts from lines[2].
    # Let's use csv.reader on the rest of the file.
    data_content = "".join(lines[2:])
    reader = csv.reader(data_content.splitlines())
    
    for row in reader:
        if not row or len(row) < 8:
            continue
        
        name = row[1].strip()
        if not name or name == "Player Name":
            continue
            
        sports_raw = row[2].strip()
        # Handle "Cricket;Volleyball" or "Cricket, Volleyball"
        sport_list = [s.strip() for s in re.split(r'[;,]', sports_raw) if s.strip()]
        
        gender = row[3].strip()
        image_url = convert_gdrive_url(row[4].strip())
        achievements = row[5].strip()
        role = row[6].strip()
        base_price = int(row[7].strip()) if row[7].strip().isdigit() else 100
        
        # Combine role and achievements
        combined_achievements = f"Role: {role} | {achievements}" if role and role != "Nil" else achievements
        
        players.append({
            "name": name,
            "sport": sport_list,
            "gender": gender,
            "basePrice": base_price,
            "image": image_url,
            "achievements": combined_achievements,
            "status": "Waiting"
        })

# Sort by gender: Female first, then Male
# Using alphabetical order ("Female" < "Male")
players.sort(key=lambda p: (p["gender"] != "Female", p["name"]))

print(json.dumps(players, indent=2))
