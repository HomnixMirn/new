from openai import OpenAI
from credits import API


async def get_completion(prompt: str):
    client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API,
    )

    completion = client.chat.completions.create(
    # extra_headers={
    #     "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
    #     "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.
    # },
    # extra_body={},
    model="meta-llama/llama-4-maverick:free",
    messages=[
        {
        "role": "user",
        "content": [{
            "type": "text",
            'text':f"Учитывай что тема моего сообщения связанна с Т2 оператором свзяи в Нижнем Новгороде, ответь учитываю эту тему, если тема совершенно дргуая напиши 'К сожалению я могу помочь только с темами связанными с Т2 оператором связи'.Весь ответ должен быть на русском языке. Вот мой вопрос:{prompt}"
        }]
        }
        ]
    )
    
    return completion.choices[0].message.content