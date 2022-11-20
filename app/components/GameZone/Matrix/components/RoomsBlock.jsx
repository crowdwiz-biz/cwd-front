import React from "react";
import Translate from "react-translate-component";
import AccountActions from "actions/AccountActions";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import NewIcon from "../../../NewIcon/NewIcon";

let cells_img = {
    neo0: require("assets/png-images/matrix/firstliner_01.png"),
    neo1: require("assets/png-images/matrix/firstliner_02.png"),
    empty: require("assets/png-images/matrix/cell_unlocked.png"),
    locked: require("assets/png-images/matrix/cell_locked--inactive.png")
};

class RoomsBlock extends React.Component {
    constructor(props) {
        super(props);
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

                let player = this.props.account.get("id");
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
                let player = this.props.account.get("id");
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
        let matrixForRender = this.props.matrixForRender;
        let activeMatrix = this.props.activeMatrix;
        let width = window.innerWidth;

        return (
            <div className="matrix-room">
                {width > 768 ? (
                    <ul className="matrix-room__level-list">
                        {matrixForRender.map(rooms => (
                            <li
                                className={
                                    rooms["active"] && rooms["roomOpened"]
                                        ? "matrix-room__level matrix-room__level--active"
                                        : "matrix-room__level"
                                }
                                key={rooms["level"]}
                            >
                                <div className="matrix-room__level-content">
                                    <div className="matrix-room__level-num">
                                        <span className="matrix-room__level-num">
                                            {rooms["level"]}
                                        </span>
                                        <Translate
                                            className="matrix-room__level-text"
                                            content="gamezone.matrix.level"
                                        />
                                    </div>

                                    <div
                                        className={
                                            rooms["active"] &&
                                            rooms["roomOpened"]
                                                ? "matrix-room__desktop-inner matrix-room__desktop-inner--active"
                                                : "matrix-room__desktop-inner"
                                        }
                                    >
                                        <div className="matrix-room__level-inner">
                                            <table className="matrix-room__table">
                                                <tbody>
                                                    <tr className="matrix-room__raw">
                                                        {rooms[
                                                            "activeCells"
                                                        ].map(cell => (
                                                            <td
                                                                className={
                                                                    rooms[
                                                                        "active"
                                                                    ] &&
                                                                    rooms[
                                                                        "roomOpened"
                                                                    ]
                                                                        ? "matrix-room__cell matrix-room__cell--active"
                                                                        : "matrix-room__cell"
                                                                }
                                                                key={cell["id"]}
                                                            >
                                                                <img
                                                                    className={
                                                                        [
                                                                            cell[
                                                                                "name"
                                                                            ]
                                                                        ] ==
                                                                        "neo0"
                                                                            ? "matrix-room__cell-img"
                                                                            : ""
                                                                    }
                                                                    src={
                                                                        cells_img[
                                                                            cell[
                                                                                "name"
                                                                            ]
                                                                        ]
                                                                    }
                                                                    alt=""
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div
                                            className={
                                                rooms["active"] &&
                                                rooms["roomOpened"]
                                                    ? "matrix-room__prize-inner matrix-room__prize-inner--active"
                                                    : "matrix-room__prize-inner"
                                            }
                                        >
                                            <span className="matrix-room__prize-img">
                                                {rooms["active"] ? (
                                                    <NewIcon
                                                        iconWidth={24}
                                                        iconHeight={24}
                                                        iconName={
                                                            "matrix_icon_prize"
                                                        }
                                                    />
                                                ) : (
                                                    <NewIcon
                                                        iconClass={
                                                            "matrix-room__prize-inactive"
                                                        }
                                                        iconWidth={24}
                                                        iconHeight={24}
                                                        iconName={
                                                            "matrix_icon_prize"
                                                        }
                                                    />
                                                )}
                                            </span>
                                            <span
                                                className={
                                                    rooms["active"]
                                                        ? "matrix-room__prize"
                                                        : "matrix-room__prize matrix-room__prize--inactive"
                                                }
                                            >
                                                {rooms["prize"]}
                                            </span>
                                            {rooms["active"] ? (
                                                <NewIcon
                                                    iconClass={
                                                        "matrix-room__prize-cwd"
                                                    }
                                                    iconWidth={24}
                                                    iconHeight={24}
                                                    iconName={"matrix_icon_cwd"}
                                                />
                                            ) : (
                                                <NewIcon
                                                    iconClass={
                                                        "matrix-room__prize-cwd matrix-room__prize-cwd--inactive"
                                                    }
                                                    iconWidth={24}
                                                    iconHeight={24}
                                                    iconName={"matrix_icon_cwd"}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {!rooms["roomOpened"] ? (
                                        <div className="matrix-room__btn-block">
                                            {rooms["active"] ? (
                                                <button
                                                    className="matrix-room__btn noselect"
                                                    onClick={this.matrixOpenRoom.bind(
                                                        this,
                                                        activeMatrix.id,
                                                        rooms["level"],
                                                        rooms["raw_price"]
                                                    )}
                                                    disabled={!rooms["active"]}
                                                >
                                                    <Translate
                                                        className="matrix-room__btn-text"
                                                        content="gamezone.matrix.btn-text"
                                                    />{" "}
                                                    <span className="matrix-room__btn-text matrix-room__btn-text--price">
                                                        {rooms["price"]} CWD
                                                    </span>
                                                </button>
                                            ) : (
                                                <div className="matrix-room__disabled-text">
                                                    <Translate
                                                        content="gamezone.matrix.dasabled_room"
                                                        unsafe
                                                    />{" "}
                                                    <span>
                                                        {parseInt(
                                                            rooms["level"]
                                                        ) - 1}
                                                    </span>
                                                </div>
                                            )}{" "}
                                        </div>
                                    ) : (
                                        <div className="matrix-room__opened noselect">
                                            <Translate content="gamezone.matrix.room_opened" />{" "}
                                            <span className="matrix-room__opened-id">
                                                {rooms["roomId"]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="matrix-room__level-list">
                        {matrixForRender.map(rooms => (
                            <li
                                className={
                                    rooms["active"] && rooms["roomOpened"]
                                        ? "matrix-room__level matrix-room__level--active"
                                        : "matrix-room__level"
                                }
                                key={rooms["level"]}
                            >
                                <div className="matrix-room__level-content">
                                    <div className="matrix-room__mobile-header">
                                        <div className="matrix-room__level-num">
                                            <span className="matrix-room__level-num">
                                                {rooms["level"]}
                                            </span>
                                            <Translate
                                                className="matrix-room__level-text"
                                                content="gamezone.matrix.level"
                                            />
                                        </div>

                                        <div
                                            className={
                                                rooms["active"] &&
                                                rooms["roomOpened"]
                                                    ? "matrix-room__prize-inner matrix-room__prize-inner--active"
                                                    : "matrix-room__prize-inner"
                                            }
                                        >
                                            <span className="matrix-room__prize-img">
                                                {rooms["active"] ? (
                                                    <NewIcon
                                                        iconWidth={24}
                                                        iconHeight={24}
                                                        iconName={
                                                            "matrix_icon_prize"
                                                        }
                                                    />
                                                ) : (
                                                    <NewIcon
                                                        iconClass="matrix-room__prize-inactive"
                                                        iconWidth={24}
                                                        iconHeight={24}
                                                        iconName={
                                                            "matrix_icon_prize"
                                                        }
                                                    />
                                                )}
                                            </span>
                                            <span
                                                className={
                                                    rooms["active"]
                                                        ? "matrix-room__prize"
                                                        : "matrix-room__prize matrix-room__prize--inactive"
                                                }
                                            >
                                                {rooms["prize"]}
                                            </span>
                                            {rooms["active"] ? (
                                                <NewIcon
                                                    iconClass="matrix-room__prize-cwd"
                                                    iconWidth={24}
                                                    iconHeight={24}
                                                    iconName={"matrix_icon_cwd"}
                                                />
                                            ) : (
                                                <NewIcon
                                                    iconClass="matrix-room__prize-cwd matrix-room__prize-cwd--inactive"
                                                    iconWidth={24}
                                                    iconHeight={24}
                                                    iconName={"matrix_icon_cwd"}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="matrix-room__level-inner">
                                        <table className="matrix-room__table">
                                            <tbody>
                                                <tr className="matrix-room__raw">
                                                    {rooms["activeCells"].map(
                                                        cell => (
                                                            <td
                                                                className={
                                                                    rooms[
                                                                        "active"
                                                                    ] &&
                                                                    rooms[
                                                                        "roomOpened"
                                                                    ]
                                                                        ? "matrix-room__cell matrix-room__cell--active"
                                                                        : "matrix-room__cell"
                                                                }
                                                                key={cell["id"]}
                                                            >
                                                                <img
                                                                    className={
                                                                        [
                                                                            cell[
                                                                                "name"
                                                                            ]
                                                                        ] ==
                                                                        "neo0"
                                                                            ? "matrix-room__cell-img"
                                                                            : ""
                                                                    }
                                                                    src={
                                                                        cells_img[
                                                                            cell[
                                                                                "name"
                                                                            ]
                                                                        ]
                                                                    }
                                                                    alt=""
                                                                />
                                                            </td>
                                                        )
                                                    )}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {!rooms["roomOpened"] ? (
                                        <div className="matrix-room__btn-block">
                                            {rooms["active"] ? (
                                                <button
                                                    className="matrix-room__btn noselect"
                                                    onClick={this.matrixOpenRoom.bind(
                                                        this,
                                                        activeMatrix.id,
                                                        rooms["level"],
                                                        rooms["raw_price"]
                                                    )}
                                                    disabled={!rooms["active"]}
                                                >
                                                    <Translate
                                                        className="matrix-room__btn-text"
                                                        content="gamezone.matrix.btn-text"
                                                    />{" "}
                                                    <span className="matrix-room__btn-text matrix-room__btn-text--price">
                                                        {rooms["price"]} CWD
                                                    </span>
                                                </button>
                                            ) : (
                                                <div className="matrix-room__disabled-text">
                                                    <Translate
                                                        content="gamezone.matrix.dasabled_room"
                                                        unsafe
                                                    />{" "}
                                                    <span>
                                                        {parseInt(
                                                            rooms["level"]
                                                        ) - 1}
                                                    </span>
                                                </div>
                                            )}{" "}
                                        </div>
                                    ) : (
                                        <div className="matrix-room__opened noselect">
                                            <Translate content="gamezone.matrix.room_opened" />{" "}
                                            <span className="matrix-room__opened-id">
                                                {rooms["roomId"]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
export default RoomsBlock;
