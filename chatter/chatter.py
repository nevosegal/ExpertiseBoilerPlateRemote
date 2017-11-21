import shutil, os

try:
    shutil.rmtree('./db/')
    os.remove("./db.sqlite3")
except:
    pass

from chatterbot import ChatBot


chatbot_time_math = ChatBot(
    'Time and Math Bot',
    logic_adapters=[
        {
            'import_path': 'chatterbot.logic.TimeLogicAdapter'
        },
        {
            'import_path': 'chatterbot.logic.MathematicalEvaluation'
        }
    ],
    trainer='chatterbot.trainers.ChatterBotCorpusTrainer'
)

chatbot_conversation = ChatBot(
    'Conversation Bot',
    trainer='chatterbot.trainers.ChatterBotCorpusTrainer'
)

chatbot_conversation.train(
    "chatterbot.corpus.english.greetings",
    "chatterbot.corpus.english.botprofile",
    "chatterbot.corpus.english.emotion",
    "chatterbot.corpus.english.humor",
    "./chatter/common.yaml"
)



chatbots = [
    chatbot_conversation,
    chatbot_time_math
]

while (True):
    question = raw_input()
    responded = False
    for chatbot in chatbots:
        response = chatbot.get_response(question)
        if response.confidence > 0.65:
            print(response)
            responded = True
            break
    if not responded:
        print("Sorry, I don't understand")
