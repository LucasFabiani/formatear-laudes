from bs4 import BeautifulSoup
import requests
import os
from fpdf import FPDF

dest_pdfs = 'pdfs/'
os.makedirs(dest_pdfs, exist_ok=True)

# Extraer nombres de los salmos
def get_salmos():
    salmos = []
    url = 'https://www.corosanclemente.com.ar/Part/Responsoriales/SR_Numerico.php'
    res = requests.get(url)

    if res.status_code == 200:
        soup = BeautifulSoup(res.content, 'html.parser')

        table = soup.find('table', id='table2')
        
        if table:
            for row in table.find_all('tr'):
                
                cells = row.find_all('td')
                if len(cells) >= 3:
                    font_tag = cells[2].find('font')
                    if font_tag:
                        link_tag = font_tag.find('a')
                        if link_tag and 'href' in link_tag.attrs:
                            link = link_tag['href']
                            if link.endswith('.php'):
                                filename = link.replace('.php', '')
                                salmos.append(filename)
    return salmos


print(get_salmos())

# Procesar contenido para el PDF
def procesar_html_para_pdf(html):
    html = html.replace('\n', '').replace('\t', '')
    html = html.replace('<i>', '').replace('</i>', '')
    html = html.replace('<b>', '').replace('</b>', '')
    html = html.replace('</p>', '\n').replace('<p>', '')
    html = html.replace('<font color="#FF0000">', '')
    html = html.replace('<font color="#FF0000" face="Palatino Linotype"', '')
    html = html.replace('<font face="Palatino Linotype">', '').replace('</font>', '\n')
    # Reemplazar <u>...</u> por marcadores personalizados
    html = html.replace('<u>', '[SUB]').replace('</u>', '[/SUB]')
    # Reemplazar <br> por saltos de línea
    html = html.replace('<br/>', '\n')
    return html

# Crear el PDF
class PDFConFormato(FPDF):
    def __init__(self):
        super().__init__()
        # Agregar una fuente personalizada
        
    def header(self):
        # Dibujar fondo crema amarillento al iniciar una nueva página
        self.set_fill_color(255, 249, 230)  # Color crema amarillento (RGB)
        self.rect(0, 0, self.w, self.h, 'F')  # Dibujar un rectángulo que cubra toda la página
    
    def escribir_con_formato(self, texto):

        subcadenas = ['<font face="Palatino Linotype">',
                      '<p><font face="Palatino Linotype">'
                      '<p><font face="Palatino Linotype"><font color="#FF0000">*</font>'
        ]
        for subcadena in subcadenas:
            if texto.startswith(subcadena):
                texto = texto[len(subcadena):]


        # Establecer una fuente predeterminada antes de escribir
        if not self.font_family:
            self.set_font("Times", size=12)
        
        # Procesar texto con marcadores personalizados
        partes = texto.split("[SUB]")
        print(partes)
        
        for parte in partes:
            if "[/SUB]" in parte:
                subrayado, normal = parte.split("[/SUB]", 1)
                self.set_font("Times", style='U', size=12)  # Activar subrayado
                self.write(10, subrayado)  # Escribir subrayado sin salto de línea
                self.set_font("Times", style='', size=12)  # Desactivar subrayado
                self.write(10, normal)  # Escribir texto normal sin salto de línea
            else:
                self.write(10, parte)  # Escribir texto normal sin subrayado
            


# Crear y guardar el PDF
def crear_pdf(name, content):
    pdf = PDFConFormato()

    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    
    # Configuración de fuente y título
    pdf.set_font("Times", size=14, style="B")
    parts = name.split('_', 1)
    title = parts[0] + ': ' + parts[1].replace('_', ' ').upper()

    pdf.cell(0, 10, f"SALMO {title}", ln=True, align="C")
    pdf.ln(10)  # Espaciado
    
    pdf.set_font("Times", size=12)

    pdf.escribir_con_formato(procesar_html_para_pdf(content))

    pdf.output(f'{dest_pdfs}{name}.pdf')
    print(f"PDF creado: {dest_pdfs}{name}.pdf")


def extract_lyrics(salm_list):
    base_url = 'https://www.corosanclemente.com.ar/Part/Responsoriales/'

    # Extraer la letra de cada salmo y crear el PDF
    for filename in salm_list:
        # Nombre del archivo PDF
        pdf_path = f'{dest_pdfs}{filename}.pdf'
        
        # Verificar si el archivo ya existe
        if os.path.exists(pdf_path):
            print(f"El PDF para {filename} ya existe. Saltando...")
            continue  # Saltar este salmo
        
        # Construir la URL de la página del salmo
        salmo_url = f"{base_url}{filename}.php"
        try:
            # Hacer la solicitud HTTP
            response = requests.get(salmo_url)
            if response.status_code == 200:
                # Parsear el contenido de la página
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Buscar la sección con la letra (modifica según la estructura de la página)
                letra_td = soup.find_all('table')[3].find('tr').find_all('td')[1]
                if letra_td:
                    content = letra_td.decode_contents()
                    name = filename.replace('SR_', '')
                    crear_pdf(name, content)
                else:
                    print(f"No se encontró la letra para {filename}.mp3")
            else:
                print(f"No se pudo acceder a {salmo_url} - Código HTTP: {response.status_code}")
        except Exception as e:
            print(f"Error al procesar {salmo_url}: {e}")


# Descargar audios con verificación de duplicados
def download_audios(salmos):
    base_url = 'https://www.corosanclemente.com.ar/Part/Responsoriales/audio/'
    dest = 'audios/'
    os.makedirs(dest, exist_ok=True)

    for filename in salmos:
        audio_path = f'{dest}{filename}.mp3'
        
        # Verificar si el archivo ya existe
        if os.path.exists(audio_path):
            print(f"El audio {filename}.mp3 ya existe. Saltando...")
            continue

        audio_url = f'{base_url}{filename}.mp3'
        
        try:
            res = requests.get(audio_url, stream=True)

            if res.status_code == 200:
                with open(audio_path, 'wb') as file:
                    for chunk in res.iter_content(chunk_size=8192):  # Tamaño mayor para rendimiento
                        file.write(chunk)
                    
                print(f"Descargado: {filename}.mp3")
            else:
                print(f"No se pudo descargar {filename}.mp3 - Código HTTP: {res.status_code}")
        except Exception as e:
            print(f"Error al descargar {filename}.mp3: {e}")


salm_list = get_salmos()
extract_lyrics(salm_list)