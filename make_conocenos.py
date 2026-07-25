import sys

with open('index.html', 'r') as f:
    lines = f.readlines()

header_end = 0
conoc_start = 0
conoc_end = 0
footer_start = 0

for i, l in enumerate(lines):
    if '</header>' in l:
        header_end = i
    if '<section class="about-section" id="conocenos"' in l:
        conoc_start = i
    if '<footer>' in l:
        footer_start = i

for i in range(conoc_start, len(lines)):
    if '</section>' in lines[i]:
        conoc_end = i
        break

head_to_header = lines[:header_end+1]
conocenos_section = lines[conoc_start:conoc_end+1]
footer_to_end = lines[footer_start:]

new_lines = head_to_header + ["\n"] + conocenos_section + ["\n"] + footer_to_end

for i in range(len(new_lines)):
    new_lines[i] = new_lines[i].replace('href="#fibra"', 'href="index.html#fibra"')
    new_lines[i] = new_lines[i].replace('href="#inalambrica"', 'href="index.html#inalambrica"')
    new_lines[i] = new_lines[i].replace('href="#formulario"', 'href="index.html#formulario"')
    new_lines[i] = new_lines[i].replace('href="#ismesh"', 'href="index.html#ismesh"')
    new_lines[i] = new_lines[i].replace('href="#iscam"', 'href="index.html#iscam"')
    new_lines[i] = new_lines[i].replace('href="#conocenos"', 'href="#"')

with open('conocenos.html', 'w') as f:
    f.writelines(new_lines)

# Remove conocenos from index.html
index_new = lines[:conoc_start] + lines[conoc_end+1:]
for i in range(len(index_new)):
    if 'href="#conocenos"' in index_new[i]:
        index_new[i] = index_new[i].replace('href="#conocenos"', 'href="conocenos.html"')

with open('index.html', 'w') as f:
    f.writelines(index_new)

print("Done")
