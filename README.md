django:
cd backend
python3 -m venv .venv
.venv\Scripts\activate
pip install poetry
poetry update
cd back
py manage.py runserver


тг :
https://openrouter.ai/settings/keys - проверить tgbot-T2
cd backend/tg-bot
py aiorgam_run.py


next:
cd front
npm i
npm run dev