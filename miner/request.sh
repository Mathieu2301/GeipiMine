curl --location --request POST 'https://www.geipi-polytech.org/integration_notes/consultation_notes.php' \
--socks4a 'localhost:9050' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode "numero_inscription=$1" \
--data-urlencode 'valider=Valider'
