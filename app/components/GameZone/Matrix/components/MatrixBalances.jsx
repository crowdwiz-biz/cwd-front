import React from "react";
import Translate from "react-translate-component";
import "react-sweet-progress/lib/style.css";
import NewIcon from "../../../NewIcon/NewIcon";

class MatrixBalances extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let totalCwdDeposit = this.props.totalCwdDeposit;
        let totalCwdWithdraw = this.props.totalCwdWithdraw;
        let balance = this.props.balance;

        return (
            <ul className="matrix-balances__list">
                <li className="matrix-balances__item">
                    <div className="matrix-balances__inner">
                        <NewIcon
                            iconClass={"matrix-balances__icon"}
                            iconWidth={55}
                            iconHeight={36}
                            iconName={"matrix_icon_income"}
                        />

                        <Translate
                            className="matrix-balances__text"
                            content="gamezone.matrix.matrix_total_deposit"
                        />

                        <span className="matrix-balances__data">
                            {totalCwdDeposit}
                        </span>
                    </div>
                </li>
                <li className="matrix-balances__item">
                    <div className="matrix-balances__inner">
                        <NewIcon
                            iconClass={"matrix-balances__icon"}
                            iconWidth={55}
                            iconHeight={36}
                            iconName={"matrix_icon_outcome"}
                        />

                        <Translate
                            className="matrix-balances__text"
                            content="gamezone.matrix.matrix_total_withdraw"
                        />

                        <span className="matrix-balances__data">
                            {totalCwdWithdraw}
                        </span>
                    </div>
                </li>
                <li className="matrix-balances__item">
                    <div className="matrix-balances__inner">
                        <NewIcon
                            iconClass={
                                "matrix-balances__icon matrix-balances__icon--big"
                            }
                            iconWidth={55}
                            iconHeight={36}
                            iconName={"matrix_icon_balance"}
                        />

                        <Translate
                            className="matrix-balances__text"
                            content="gamezone.matrix.matrix_balance"
                        />

                        <span className="matrix-balances__data">{balance}</span>
                    </div>
                </li>
                <li className="matrix-balances__item">
                    <div className="matrix-balances__inner">
                        <NewIcon
                            iconClass={
                                "matrix-balances__icon matrix-balances__icon--big"
                            }
                            iconWidth={55}
                            iconHeight={36}
                            iconName={"matrix_icon_reload"}
                        />

                        <Translate
                            className="matrix-balances__text"
                            content="gamezone.matrix.matrix_relaunch"
                        />

                        <span className="matrix-balances__data">0 %</span>
                    </div>
                </li>
            </ul>
        );
    }
}
export default MatrixBalances;
