from sanic import Sanic
from sanic.log import logger
from sanic.response import json
from uuid import getnode as get_mac


app = Sanic()

@app.route("/")
async def hello(request):
	mac = get_mac()
	return json({"macAddress": mac})

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=80, debug=True, access_log=True)
