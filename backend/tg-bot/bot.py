from aiogram import types, Bot, Dispatcher, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.filters import CommandStart, Command
from aiogram.enums import ParseMode
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
from threading import Timer

from generator import get_completion


import load_dotenv
import os
import asyncio

load_dotenv.load_dotenv()

bot = Bot(token=os.getenv('TOKEN'), default= DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher(storage=MemoryStorage())

router = Router()



cache = {}

def clear_cache():
    global cache
    cache = {}
    print('cache cleared')
    timer = Timer(3600, clear_cache)
    timer.daemon = True
    timer.start()


clear_cache()


@router.message()
async def send_help(message: types.Message) -> None:
    
    answer = await get_completion(message.text)
    await message.answer(
       answer
    )