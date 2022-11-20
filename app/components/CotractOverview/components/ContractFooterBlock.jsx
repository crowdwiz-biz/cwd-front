import React from "react";
import Translate from "react-translate-component";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";


class ContractFooterBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    isWalletLocked(contract, e) {
        e.preventDefault();

        if (WalletDb.isLocked()) {
            WalletUnlockActions.unlock()
                .then(() => {
                    AccountActions.tryToSetCurrentAccount();
                    this.upgradeAccountContract(contract);
                })
                .catch(() => { });
        } else {
            this.upgradeAccountContract(contract);
        }
    }

    upgradeAccountContract(contract) {
        let currentAccountId = this.props.currentAccount.get("id");
        AccountActions.upgradeStatusAccount(currentAccountId, contract);
    }

    render() {
        let currentContract = this.props.currentContract;
        let contracts = [1, 2, 3, 4];

        let contractExpirationDateRaw = this.props.contractExpirationDate;

        if (contractExpirationDateRaw) {
            var myStdate = new Date(contractExpirationDateRaw + "Z");
            var statusExpirationDate = myStdate.toLocaleString();
        }

        return (
            <div className="contract-table__footer">
                <div className="contract-table__footer-cell"></div>
                {contracts.map(item => (
                    <div
                        key={item}
                        className={currentContract == item ?
                            "contract-table__footer-cell contract-table__footer-cell--current-contract"
                            : "contract-table__footer-cell"}
                    >
                        <button
                            className="cwd-btn__square-btn"
                            onClick={this.isWalletLocked.bind(this, item)}
                            disabled={item < currentContract ? true : false}
                        >
                            {currentContract == item ?
                                <Translate content="contract_overview.table.update_btn" />
                                :
                                <Translate content="contract_overview.table.choose_btn" />
                            }
                        </button>

                        {currentContract == item ?
                            <div className="contract-table__footer-ex-data-block">
                                <Translate
                                    className="contract-table__label"
                                    content="user_profile.expiration_date"
                                />
                                <span className="contract-table__text">
                                    {statusExpirationDate}&nbsp;(GMT)
                            </span>
                            </div>
                            : null}
                    </div>
                ))}
            </div>
        );
    }
}

export default ContractFooterBlock;