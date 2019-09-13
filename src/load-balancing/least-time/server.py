from sanic import Sanic
from sanic.log import logger
from sanic.response import json

app = Sanic()

@app.route("/v1/hello")
async def hello(request):
	return json({"hello": "world"})

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=4500, debug=True, access_log=True)
