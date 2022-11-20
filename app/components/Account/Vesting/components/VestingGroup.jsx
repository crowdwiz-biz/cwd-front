import React from "react";
import VestingBalance from "./VestingBalance";
import counterpart from "counterpart";
import Translate from "react-translate-component";

class VestingGroup extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let vbs = this.props.vbs;
        let account = this.props.account;
        let width = window.innerWidth;
        let tablet = 768;
        let tableHead = (
            <div className="vesting__head">
                <Translate component="div" content="account.vesting.balance" />
                <Translate
                    component="div"
                    content="account.vesting.total-deposit"
                />
                <Translate
                    component="div"
                    content="account.vesting.available"
                />
                <Translate
                    component="div"
                    content="account.vesting.withdrawed"
                />
            </div>
        );

        return (
            <div className="vesting__group-wrap">
                <p className="vesting__group-title">
                    {counterpart.translate(
                        "account.vesting." + this.props.asset_id
                    )}
                </p>
                {width > tablet && tableHead}
                {vbs.map(vObj => (
                    <VestingBalance
                        key={vObj.id}
                        vb={vObj}
                        account={account}
                        handleChanged={this.props.handleChanged}
                        notAvailable={
                            vObj.policy[1].vesting_duration_seconds == 0 &&
                            vObj.policy[0] == 0
                        }
                    />
                ))}
            </div>
        );
    }
}

export default VestingGroup;
