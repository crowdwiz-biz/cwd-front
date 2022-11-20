import React from "react";
import Translate from "react-translate-component";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import AccountStore from "stores/AccountStore";
import WalletDb from "stores/WalletDb";
import {ChainStore} from "bitsharesjs";
import {Apis} from "bitsharesjs-ws";
import {RecentTransactions} from "../../Account/RecentTransactions";
import {connect} from "alt-react";
import TransactionConfirmStore from "stores/TransactionConfirmStore";
import "react-sweet-progress/lib/style.css";
import MatrixData from "./components/MatrixData";
import MatrixBalances from "./components/MatrixBalances";
import ReferralInfo from "./components/ReferralInfo";
import RoomsBlock from "./components/RoomsBlock";


//STYLES
import "./scss/matrix-game.scss";
import "./scss/matrix-header.scss";
import "./scss/matrix-body.scss";
import "./scss/matrix-balances.scss";
import "./scss/ref-info.scss";
import "./scss/matrix-room.scss";

class GameMatrixDev extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentAccount: this.props.match.params.account_name,
            accountID: "",
            isUserActivated: true,
            currentBlock: {},
            activeMatrix: {
                id: "1.18.0",
                start_block_number: 3491491,
                finish_block_number: 4491491,
                status: 0,
                amount: 0,
                total_amount: 0,
                last_120k_amount: 0,
                matrix_level_1_price: 4500000,
                matrix_level_2_price: 8000000,
                matrix_level_3_price: 21800000,
                matrix_level_4_price: 79000000,
                matrix_level_5_price: 287000000,
                matrix_level_6_price: 782000000,
                matrix_level_7_price: 1420000000,
                matrix_level_8_price: 2580000000,
                matrix_level_1_prize: 9000000,
                matrix_level_2_prize: 24000000,
                matrix_level_3_prize: 87200000,
                matrix_level_4_prize: 316000000,
                matrix_level_5_prize: 861000000,
                matrix_level_6_prize: 1564000000,
                matrix_level_7_prize: 2840000000,
                matrix_level_8_prize: 5160000000,
                matrix_level_1_cells: 2,
                matrix_level_2_cells: 3,
                matrix_level_3_cells: 4,
                matrix_level_4_cells: 4,
                matrix_level_5_cells: 3,
                matrix_level_6_cells: 2,
                matrix_level_7_cells: 2,
                matrix_level_8_cells: 2
            },
            activeRooms: [],
            cellsOpened: 0,
            activeLevels: 1,
            currentStatus: 0,
            matrix_cells_opened: 0,
            intervalID: 0
        };
        this.getActiveMatrix = this.getActiveMatrix.bind(this);
    }

    componentDidMount() {
        this.getActiveMatrix();

        this.setState({
            intervalID: setInterval(this.getActiveMatrix.bind(this), 5000)
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    getActiveMatrix() {
        //BLOCKS
        Apis.instance()
            .db_api()
            .exec("get_dynamic_global_properties", [])
            .then(blocks => {
                this.setState({
                    currentBlock: blocks.head_block_number
                });
                // MATRIX
                Apis.instance()
                    .db_api()
                    .exec("get_active_matrix", [])
                    .then(matrix => {
                        if (matrix.length > 0) {
                            this.setState({
                                activeMatrix: matrix[0]
                            });
                            // STATS
                            Apis.instance()
                                .db_api()
                                .exec("get_full_accounts", [
                                    [this.props.match.params.account_name],
                                    false
                                ])
                                .then(stat => {
                                    let activeLevel;
                                    let cellsOpened;
                                    if (
                                        stat[0][1].statistics.matrix ==
                                        this.state.activeMatrix.id
                                    ) {
                                        activeLevel =
                                            stat[0][1].statistics
                                                .matrix_active_levels;
                                        cellsOpened =
                                            stat[0][1].statistics
                                                .matrix_cells_opened;
                                        if (
                                            activeLevel <
                                            stat[0][1].account
                                                .referral_status_type *
                                                2
                                        ) {
                                            activeLevel =
                                                stat[0][1].account
                                                    .referral_status_type * 2;
                                        }
                                    } else {
                                        activeLevel =
                                            stat[0][1].account
                                                .referral_status_type * 2;
                                        cellsOpened = 0;
                                    }
                                    if (activeLevel == 0) {
                                        activeLevel = 1;
                                    }

                                    this.setState({
                                        cellsOpened: cellsOpened,
                                        activeLevels: activeLevel,
                                        currentStatus:
                                            stat[0][1].account
                                                .referral_status_type,
                                        accountID: stat[0][1].account.id,
                                        matrix_cells_opened:
                                            stat[0][1].statistics
                                                .matrix_cells_opened
                                    });
                                    // ROOMS
                                    Apis.instance()
                                        .db_api()
                                        .exec("get_rooms_by_player", [
                                            this.state.accountID
                                        ])
                                        .then(rooms => {
                                            this.setState({
                                                activeRooms: rooms
                                            });
                                        })
                                        .catch(err => {
                                            console.log("error:", err);
                                        });
                                });
                        }
                    })
                    .catch(err => {
                        console.log("error:", err);
                    });
            })
            .catch(err => {
                console.log("error:", err);
            });
    }

    matrixOpenRoom(matrix, level, price, e) {
        e.preventDefault();
        if (this.props.account) {
            if (WalletDb.isLocked()) {
                WalletUnlockActions.unlock()
                    .then(() => {
                        AccountActions.tryToSetCurrentAccount();
                    })
                    .catch(() => {});

                let player = this.state.accountID;
                let matrix_id = matrix;
                let matrix_level = level;
                let level_price = price;

                AccountActions.matrixOpenRoom(
                    matrix_id,
                    player,
                    matrix_level,
                    level_price
                )
                    .then(() => {
                        TransactionConfirmStore.unlisten(this.onTrxIncluded);
                        TransactionConfirmStore.listen(this.onTrxIncluded);
                    })
                    .catch(err => {
                        console.log("error:", err);
                    });
            } else {
                let player = this.state.accountID;
                let matrix_id = matrix;
                let matrix_level = level;
                let level_price = price;
                AccountActions.matrixOpenRoom(
                    matrix_id,
                    player,
                    matrix_level,
                    level_price
                )
                    .then(() => {
                        TransactionConfirmStore.unlisten(this.onTrxIncluded);
                        TransactionConfirmStore.listen(this.onTrxIncluded);
                    })
                    .catch(err => {
                        console.log("error:", err);
                    });
            }
        } else {
            this.props.history.push("/create-account/password");
        }
    }

    render() {
        let matrixForRender = [];
        let needToReload =
            this.state.currentBlock -
            this.state.activeMatrix.finish_block_number +
            120000;

        for (let index = 1; index <= 8; index++) {
            matrixForRender[index] = [];
            matrixForRender[index]["level"] = index;
            matrixForRender[index]["cells"] = this.state.activeMatrix[
                "matrix_level_" + index.toString() + "_cells"
            ];
            matrixForRender[index]["price"] =
                Math.round(
                    (parseInt(
                        this.state.activeMatrix[
                            "matrix_level_" + index.toString() + "_price"
                        ]
                    ) /
                        100000) *
                        110
                ) / 100;
            matrixForRender[index]["raw_price"] = parseInt(
                this.state.activeMatrix[
                    "matrix_level_" + index.toString() + "_price"
                ]
            );
            matrixForRender[index]["prize"] =
                parseInt(
                    this.state.activeMatrix[
                        "matrix_level_" + index.toString() + "_prize"
                    ]
                ) / 100000;
            if (this.state.activeLevels >= index) {
                matrixForRender[index]["active"] = true;
            } else {
                matrixForRender[index]["active"] = false;
            }
            if (this.state.cellsOpened >= 2) {
                matrixForRender[index]["cellsOpened"] = true;
            } else {
                matrixForRender[index]["cellsOpened"] = false;
            }
            matrixForRender[index]["roomOpened"] = false;
            matrixForRender[index]["activeCells"] = [];
            for (
                let cells_index = 0;
                cells_index < matrixForRender[index]["cells"];
                cells_index++
            ) {
                matrixForRender[index]["activeCells"][cells_index] = {};
                matrixForRender[index]["activeCells"][cells_index][
                    "id"
                ] = cells_index;
                if (matrixForRender[index]["cellsOpened"]) {
                    matrixForRender[index]["activeCells"][cells_index]["name"] =
                        "empty";
                } else {
                    matrixForRender[index]["activeCells"][cells_index]["name"] =
                        "locked";
                }
            }
            matrixForRender[index]["roomId"] = "-";
            if (
                this.state.currentStatus == 0 &&
                this.state.activeRooms.length > 0
            ) {
                matrixForRender[index]["active"] = false;
            }
            this.state.activeRooms.forEach(element => {
                if (element.matrix_level == index) {
                    matrixForRender[index]["active"] = true;
                    matrixForRender[index]["roomOpened"] = true;
                    matrixForRender[index]["roomId"] = element.id;
                    for (
                        let cells_index = 0;
                        cells_index < element.cells.length;
                        cells_index++
                    ) {
                        matrixForRender[index]["activeCells"][cells_index][
                            "name"
                        ] = "neo" + cells_index.toString(); //element.cells[cells_index];
                    }
                }
            });
        }

        let resultFinish = parseInt(
            this.state.activeMatrix.finish_block_number -
                this.state.currentBlock
        );
        let resultStart = parseInt(
            this.state.activeMatrix.start_block_number - this.state.currentBlock
        );

        let currentBlock = this.state.currentBlock;
        let startBlock = parseInt(this.state.activeMatrix.start_block_number);

        let blocksPersent;

        if (this.state.activeMatrix.start_block_number - currentBlock < 0) {
            blocksPersent =
                ((currentBlock - startBlock) /
                    (this.state.activeMatrix.finish_block_number -
                        this.state.activeMatrix.start_block_number)) *
                100;
        } else {
            blocksPersent =
                ((currentBlock - startBlock + 120000) / 120000) * 100;
        }

        return (
            <div className="matrix-game__wrap">
                <div className="matrix-game">
                    {/* HEADER */}
                    <div className="matrix-header">
                        <div className="matrix-header__inner">
                            <Translate
                                className="matrix-header__intro"
                                content="gamezone.matrix-intro"
                            />
                            <div className="matrix-header__text-wrap">
                                <Translate content="gamezone.matrix-title" />
                                <span>{this.state.activeMatrix.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* MATRIX */}
                    <MatrixData
                        blocksPercent={Math.abs(blocksPersent)}
                        currentBlock={this.state.currentBlock}
                        startBlockNum={
                            this.state.activeMatrix.start_block_number
                        }
                        finishBlockNum={
                            this.state.activeMatrix.finish_block_number
                        }
                        resultStart={resultStart}
                        resultFinish={resultFinish}
                    />

                    {/* MATRIX BALANCES */}
                    {this.state.activeMatrix.start_block_number -
                        this.state.currentBlock >
                    0 ? null : (
                        <MatrixBalances
                            totalCwdDeposit={
                                this.state.activeMatrix.total_amount / 100000
                            }
                            totalCwdWithdraw={
                                (this.state.activeMatrix.total_amount -
                                    this.state.activeMatrix.amount) /
                                100000
                            }
                            balance={this.state.activeMatrix.amount / 100000}
                            reload={
                                this.state.activeMatrix.total_amount > 0 &&
                                needToReload > 0
                                    ? Math.round(
                                          (1 /
                                              (((this.state.activeMatrix
                                                  .total_amount /
                                                  (this.state.currentBlock -
                                                      this.state.activeMatrix
                                                          .start_block_number)) *
                                                  0.7) /
                                                  (this.state.activeMatrix
                                                      .last_120k_amount /
                                                      needToReload))) *
                                              100
                                      )
                                    : 100
                            }
                        />
                    )}

                    {/*REFERRAL INFO*/}
                    <ReferralInfo currentAccount={this.state.currentAccount} />

                    {/* ROOMS */}
                    {this.state.activeMatrix.start_block_number -
                        this.state.currentBlock >
                    0 ? null : (
                        <RoomsBlock
                            account={this.props.account}
                            matrixForRender={matrixForRender}
                            activeMatrix={this.state.activeMatrix}
                        />
                    )}

                    {/* HISTORY */}
                    <div className="matrix-game__history-wrap">
                        {this.props.account ? (
                            <div className="matrix-game__trn-wrap">
                                <Translate
                                    className="matrix-game__title"
                                    content="gamezone.matrix-history"
                                    component="span"
                                />
                                <RecentTransactions
                                    accountsList={[this.state.accountID]}
                                    compactView={false}
                                    showMore={true}
                                    fullHeight={true}
                                    limit={10}
                                    showFilters={false}
                                    dashboard
                                    multiFilter={[62, 63, 64]}
                                    gamezoneView={true}
                                    shortMode={true}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
}
export default GameMatrixDev = connect(GameMatrixDev, {
    listenTo() {
        return [AccountStore];
    },
    getProps() {
        if (AccountStore.getState().passwordAccount) {
            return {
                account: ChainStore.fetchFullAccount(
                    AccountStore.getState().passwordAccount
                )
            };
        }
    }
});
