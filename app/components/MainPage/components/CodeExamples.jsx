import React from "react";
import Translate from "react-translate-component";
import {Tabs, Tab} from "../../Utility/Tabs";
import SyntaxHighlighter from "react-syntax-highlighter";
import {vs2015} from "react-syntax-highlighter/dist/esm/styles/hljs";

class CodeExamples extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let codeString_01 = `#All Pyhton examples required Python library "cwordwiz"
# You may install it with PIP:
# pip install crowdwiz

from crowdwiz import CrowdWiz
from crowdwiz.account import Account

# you may setup your own blockchain node and use it
cwd = CrowdWiz(node="wss://cwd.global/ws") 

# you can get information about any account in blockchain
# for example we will use cwd-global account
account=Account("cwd-global", blockchain_instance = cwd) 

# get and print accounts balance objects
print(account.balances) 

# get and print accounts open orders on DEX
print(account.openorders) 

# get account history iterator 
# (history depth limited by API node, for public nodes it equals 100 ops)
for h in account.history(): 
    print(h)`;

        let codeString_02 = `# All Pyhton examples required Python library "cwordwiz"
# You may install it with PIP:
# pip install crowdwiz

from crowdwiz import CrowdWiz

# you may setup your own blockchain node and use it
# for operations execution you need private keys from your Account
# you can get yours PK in WIF format from Account->Permissions
keys=[
    "ACTIVE_PRIVATE_KEY_FROM_YOUR_ACCOUNT",
    "MEMO_PRIVATE_KEY_FROM_YOUR_ACCOUNT"
    ]
cwd = CrowdWiz(node="wss://cwd.global/ws", keys=keys) 

# In transfer operation you must set number of fields:
# from - who transfer, you must provide private keys from this
#    account at CrowdWiz initialization (example: cwd-global)
# to - recepient of the transfer (example: adorable-star)
# ammount - amount of asset to transfer (example: 10)
# asset - asset name (example: CWD)
# memo - optionaly you can set message for recepient (it will be encoded)
cwd.transfer("super-star", "10", "CWD", "[<memo>]", account="cwd-global")`;
        let codeString_03 = `# ATTENTION
# Market trading is accompanied by risk! 
# By using this code, you accept all risks and responsibility!

# All Pyhton examples required Python library "cwordwiz"
# You may install it with PIP:
# pip install crowdwiz

from crowdwiz import CrowdWiz
from crowdwiz.account import Account
from crowdwiz.market import Market

# you may setup your own blockchain node and use it
# for operations execution you need private keys from your Account
# you can get yours PK in WIF format from Account->Permissions
keys=[
    "ACTIVE_PRIVATE_KEY_FROM_YOUR_ACCOUNT"
    ]
cwd = CrowdWiz(node="wss://cwd.global/ws", keys=keys) 

# now we can get information about selected market (example: MGCWD to CWD) 
market = Market("MGCWD:CWD", blockchain_instance = cwd)
print(market.ticker())

# let's get orderbook for selected market
print(market.orderbook(limit=25))

# Let put a limit order to buy 1 MGCWD at 200 CWD
market.buy(200, 1, account="cwd-global")
# and put a limit order to sell 1 MGCWD at 220 CWD
market.sell(220, 1, account="cwd-global")

# and also we can get all our oprnrd orders
# and cancel them if we don't need them anymore
for order in market.accountopenorders(account="cwd-global"):
    market.cancel(order['id'],account="cwd-global")`;

        let codeString_04 = `# ATTENTION
# Gambling is accompanied by risk! 
# By using this code, you accept all risks and responsibility!
# This code it's just demonstration of API calls

# All Pyhton examples required Python library "cwordwiz"
# You may install it with PIP:
# pip install crowdwiz

import json
from websocket import create_connection
from crowdwiz import CrowdWiz

# you may setup your own blockchain node and use it
# for operations execution you need private keys from your Account
# you can get yours PK in WIF format from Account->Permissions
keys=[
    "ACTIVE_PRIVATE_KEY_FROM_YOUR_ACCOUNT"
    ]
cwd_api_node = "wss://cwd.global/ws"

cwd = CrowdWiz(node=cwd_api_node, keys=keys) 
ws = create_connection(cwd_api_node)

# Small function to call blockchain API, but you can call it directly
# from websockets
def cwd_api(method, params=''):
    wsstring='{"jsonrpc": "2.0", "method": "%s" "params": [%s], "id": 1}' % (
        method, json.dumps(params)
    )
    ws.send(wsstring)
    result = ws.recv()
    res = json.loads(result) 
    return res["result"]

# Our easy bot find active bets and then call all bets which bet 
# in range between MIN_BETS_PRICE and MAX_BETS_PRICE
# PRECISION - we need it because in Blockchain objects assets stores 
# in integers like SATOSHI

PRECISION = 100000
MAX_BETS_PRICE = 3
MIN_BETS_PRICE = 1

# calling API and getting all active bets
bets = cwd_api('get_active_flipcoin',0)
for bet in bets:
    bet_price = float(float(bet.get('bet', {}).get('amount', 0)) / PRECISION)
    if bet_price <= MAX_BETS_PRICE and bet_price>=MIN_BETS_PRICE:
    try:
    #call bet in it in our range
    call_result = cwd.flipcoin_call( bet=bet_price, 
            asset="CWD", 
            flipcoin=bet.get('id', ''),
            caller="cwd-global"
            )
    print(call_result)
    except Exception as e:
    print(str(e))`;

        let codeString_05 = `# You can get information from Blockchain with simple curl requests
# All data stored in blockchain in JSON format
# get information about Accounts
# you can use your own blockchain api node different from https://cwd.global/ws
curl --data '{"jsonrpc": "2.0", "method": "get_full_accounts" "params": [["cwd-global"], false], "id": 1}' https://cwd.global/ws
# get any object by ID, lets get core asset CWD with ID 1.3.0 
curl --data '{"jsonrpc": "2.0", "method": "get_objects" "params": [["1.3.0"], false], "id": 1}' https://cwd.global/ws
# get any object by ID, lets get core asset CWD with ID 1.3.0 
curl --data '{"jsonrpc": "2.0", "method": "get_help" "params": ["", false], "id": 1}' https://cwd.global/ws
# or we can get current blockchain properties
curl --data '{"jsonrpc": "2.0", "method": "get_dynamic_global_properties" "params": ["", false], "id": 1}' https://cwd.global/ws

#All methods you can get on github https://github.com/crowdwiz-biz/crowdwiz-core/blob/master/libraries/app/include/graphene/app/database_api.hpp`;

        let containerWidth = window.innerWidth;

        return (
            <section className="mp-center-wrap">
                <div className="mp-center-wrap mp-common__inner">
                    <div className="mp-common__left-column">
                        <Translate
                            className="mp-common__title"
                            content="main_page.code_block.title"
                            component="h2"
                        />

                        <Translate
                            className="mp-common__description"
                            content="main_page.code_block.description"
                        />
                    </div>

                    <div className="mp-common__right-column mp-common__right-column--flex">
                        {/* CODE SNIPPETS */}
                        {containerWidth > 1280 ? (
                            <Tabs
                                className="main-page-tabs"
                                tabsClass="main-page-tabs__list"
                                contentClass="main-page-tabs__content"
                                segmented={false}
                                actionButtons={false}
                                indicatorColor="primary"
                                textColor="primary"
                            >
                                <Tab title="main_page.code_block.tab_01">
                                    <SyntaxHighlighter
                                        language="python"
                                        style={vs2015}
                                        showLineNumbers={true}
                                    >
                                        {codeString_01}
                                    </SyntaxHighlighter>
                                </Tab>
                                <Tab title="main_page.code_block.tab_02">
                                    <SyntaxHighlighter
                                        language="python"
                                        style={vs2015}
                                        showLineNumbers={true}
                                    >
                                        {codeString_02}
                                    </SyntaxHighlighter>
                                </Tab>
                                <Tab title="main_page.code_block.tab_03">
                                    <SyntaxHighlighter
                                        language="python"
                                        style={vs2015}
                                        showLineNumbers={true}
                                    >
                                        {codeString_03}
                                    </SyntaxHighlighter>
                                </Tab>
                                <Tab title="main_page.code_block.tab_04">
                                    <SyntaxHighlighter
                                        language="python"
                                        style={vs2015}
                                        showLineNumbers={true}
                                    >
                                        {codeString_04}
                                    </SyntaxHighlighter>
                                </Tab>
                                <Tab title="main_page.code_block.tab_05">
                                    <SyntaxHighlighter
                                        language="shell"
                                        style={vs2015}
                                        showLineNumbers={true}
                                        wrapLines={true}
                                        wrapLongLines={true}
                                    >
                                        {codeString_05}
                                    </SyntaxHighlighter>
                                </Tab>
                            </Tabs>
                        ) : null}
                        <a
                            href="https://github.com/crowdwiz-biz"
                            className={
                                containerWidth > 1280
                                    ? "mp-common__btn noselct"
                                    : "mp-common__btn mp-common__btn--gold-bg noselct"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Translate content="main_page.code_block.git_btn" />
                        </a>
                    </div>
                </div>
            </section>
        );
    }
}

export default CodeExamples;
