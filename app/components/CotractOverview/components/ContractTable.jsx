import React from "react";
import WalletDb from "stores/WalletDb";
import WalletUnlockActions from "actions/WalletUnlockActions";
import AccountActions from "actions/AccountActions";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import ContractHeaderBlock from "./ContractHeaderBlock";
import ContractRow from "./ContractRow";
import ContractFooterBlock from "./ContractFooterBlock";
import { priceData } from "./utility/TabDataPrice";


// CONTRACT ICONS
let start = require("assets/svg-images/svg-common/contracts-icons/start.svg");
let expert = require("assets/svg-images/svg-common/contracts-icons/expert.svg");
let citizen = require("assets/svg-images/svg-common/contracts-icons/citizen.svg");
let infinity = require("assets/svg-images/svg-common/contracts-icons/infinity.svg");

class ContractTable extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let {
            currentAccount,
            tabData,
            currentContract,
            contractExpirationDate
        } = this.props;

        let contractData = [
            {
                icon: start,
                name: "Start",
                contract: 1
            },
            {
                icon: expert,
                name: "Expert",
                contract: 2
            },
            {
                icon: citizen,
                name: "Citizen",
                contract: 3
            },
            {
                icon: infinity,
                name: "Infinity",
                contract: 4
            }
        ];

        let tabDataPrice = priceData;

        return (
            <div className="contract-table">
                {/* HEADER */}
                <div className="contract-table__header">
                    <Translate
                        className="contract-table__title"
                        content={"contract_overview.table." + this.props.title}
                    />

                    {contractData.map(item => (
                        <ContractHeaderBlock
                            key={item.contract}
                            name={item.name}
                            icon={item.icon}
                            contract={item.contract}
                            currentContract={currentContract}
                        />
                    ))}
                </div>

                {/* BODY */}
                <div className="contract-table__body">
                    {tabData.map(item => (
                        <ContractRow
                            key={item["rowTitle"]}
                            rowTitle={item["rowTitle"]}
                            cell_01={item["cell_01"]}
                            cell_02={item["cell_02"]}
                            cell_03={item["cell_03"]}
                            cell_04={item["cell_04"]}
                            titleDataType={item["titleDataType"]}
                            currentContract={currentContract}
                        />
                    ))}
                    {tabDataPrice.map(item => (
                        <ContractRow
                            key={item["rowTitle"]}
                            rowTitle={item["rowTitle"]}
                            cell_01={item["cell_01"]}
                            cell_02={item["cell_02"]}
                            cell_03={item["cell_03"]}
                            cell_04={item["cell_04"]}
                            titleDataType={item["titleDataType"]}
                            currentContract={currentContract}
                        />
                    ))}
                </div>

                {/* FOOTER */}
                <ContractFooterBlock
                    currentAccount={currentAccount}
                    currentContract={currentContract}
                    contractExpirationDate={contractExpirationDate}
                />
            </div>
        );
    }
}

export default ContractTable;