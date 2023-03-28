import re

url_pattern_in_html = re.compile(r'href=(?:"|\')?(\S+)(?:"|\')(?:\s|>)')
url_pattern_in_plain_text = re.compile(r'https?://\S+')
