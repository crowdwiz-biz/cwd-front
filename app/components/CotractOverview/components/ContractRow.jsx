import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";


class ContractRow extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {
            currentContract,
            rowTitle,
            cell_01,
            cell_02,
            cell_03,
            cell_04,
            titleDataType
        } = this.props;

        return (
            <div className="contract-table__row">
                {/* CELL TITLE */}
                <div className="contract-table__row-cell">
                    {titleDataType == "number" ?
                        <span className="contract-table__row-title">{rowTitle}</span>
                        :
                        <Translate
                            className="contract-table__row-title"
                            content={"contract_overview.table." + rowTitle}
                        />
                    }
                </div>

                <div className={currentContract == 1 ?
                    "contract-table__row-cell contract-table__row-cell--current-contract" : "contract-table__row-cell"}>
                    {cell_01["type"] == "text" ?
                        <span className="contract-table__row-data">
                            {cell_01["data"]}
                        </span>
                        :
                        <NewIcon
                            iconWidth={20}
                            iconHeight={20}
                            iconName={cell_01["data"]}
                        />
                    }
                </div>

                <div className={currentContract == 2 ?
                    "contract-table__row-cell contract-table__row-cell--current-contract" : "contract-table__row-cell"}>
                    {cell_02["type"] == "text" ?
                        <span className="contract-table__row-data">
                            {cell_02["data"]}
                        </span>
                        :
                        <NewIcon
                            iconWidth={20}
                            iconHeight={20}
                            iconName={cell_02["data"]}
                        />
                    }
                </div>

                <div className={currentContract == 3 ?
                    "contract-table__row-cell contract-table__row-cell--current-contract" : "contract-table__row-cell"}>
                    {cell_03["type"] == "text" ?
                        <span className="contract-table__row-data">
                            {cell_03["data"]}
                        </span>
                        :
                        <NewIcon
                            iconWidth={20}
                            iconHeight={20}
                            iconName={cell_03["data"]}
                        />
                    }
                </div>

                <div className={currentContract == 4 ?
                    "contract-table__row-cell contract-table__row-cell--current-contract" : "contract-table__row-cell"}>
                    {cell_04["type"] == "text" ?
                        <span className="contract-table__row-data">
                            {cell_04["data"]}
                        </span>
                        :
                        <NewIcon
                            iconWidth={20}
                            iconHeight={20}
                            iconName={cell_04["data"]}
                        />
                    }
                </div>
            </div>
        );
    }
}

export default ContractRow;