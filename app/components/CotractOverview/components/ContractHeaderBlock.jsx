import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";


class ContractHeaderBlock extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let { icon, name, contract, currentContract } = this.props;

        return (
            <div className={contract == currentContract ?
                "contract-table__header-cell contract-table__header-cell--current-contract" : "contract-table__header-cell"}>

                {contract == currentContract ?
                    <div className="contract-table__current-marker">
                        <NewIcon
                            iconWidth={7}
                            iconHeight={5}
                            iconName={"icon_ok"}
                        />
                        <Translate content="contract_overview.table.current_contract"/>
                    </div>
                    : null}
                    
                <img src={icon} className="contract-table__header-icon" alt={name} />

                <span className="contract-table__header-name">{name}</span>
            </div>
        );
    }
}

export default ContractHeaderBlock;