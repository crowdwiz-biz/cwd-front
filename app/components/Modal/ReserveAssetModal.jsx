import React from "react";
import BalanceComponent from "../Utility/BalanceComponent";
import counterpart from "counterpart";
import AmountSelector from "../Utility/AmountSelector";
import AssetActions from "actions/AssetActions";
import {ChainStore} from "bitsharesjs";
import {Asset} from "common/MarketClasses";
import AssetWrapper from "../Utility/AssetWrapper";
import {Modal, Button, Form} from "crowdwiz-ui-modal";
import Translate from "react-translate-component";

class ReserveAssetModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);

        this.onSubmit = this.onSubmit.bind(this);
    }

    UNSAFE_componentWillReceiveProps(np) {
        if (
            np.asset &&
            this.props.asset &&
            np.asset.get("id") !== this.props.asset.get("id")
        ) {
            this.setState(this.getInitialState(np));
        }
    }

    getInitialState(props) {
        return {
            amount: 0,
            amountAsset: new Asset({
                amount: 0,
                asset_id: props.asset.get("id"),
                precision: props.asset.get("precision")
            })
        };
    }

    onAmountChanged({amount, asset}) {
        this.state.amountAsset.setAmount({real: amount});
        this.setState({amount, asset});
    }

    onSubmit() {
        AssetActions.reserveAsset(
            this.state.amountAsset.getAmount(),
            this.props.asset.get("id"),
            this.props.account.get("id")
        ).then(() => {
            this.state.amountAsset.setAmount({sats: 0});
            this.setState({amount: 0});
        });
        this.props.hideModal();
    }

    render() {
        let assetId = this.props.asset.get("id");

        let currentBalance =
            this.props.account &&
            this.props.account.get("balances", []).size &&
            !!this.props.account.getIn(["balances", assetId])
                ? ChainStore.getObject(
                      this.props.account.getIn(["balances", assetId])
                  )
                : null;
        if (!currentBalance) return null;

        let balance = (
            <span>
                <Translate
                    className="transfer__text"
                    content="transfer.available"
                />{" "}
                <span
                    className="valid-amount"
                    onClick={() => {
                        this.state.amountAsset.setAmount({
                            sats: currentBalance.get("balance")
                        });
                        this.setState({
                            amount: this.state.amountAsset.getAmount({
                                real: true
                            })
                        });
                    }}
                >
                    <BalanceComponent
                        balance={this.props.account.getIn([
                            "balances",
                            assetId
                        ])}
                    />
                </span>
            </span>
        );

        return (
            <Modal
                className="cwd-send-modal"
                visible={this.props.visible}
                onCancel={this.props.hideModal}
                title={counterpart.translate("modal.reserve.title")}
                footer={[
                    <Button
                        key="cancel"
                        onClick={this.props.hideModal}
                        className="cwd-btn__rounded cwd-btn__rounded--cancel"
                    >
                        {counterpart.translate("transfer.cancel")}
                    </Button>,

                    <Button
                        key="submit"
                        onClick={this.onSubmit}
                        className="cwd-btn__rounded cwd-btn__rounded--confirm"
                    >
                        {counterpart.translate("modal.reserve.donate")}
                    </Button>
                ]}
            >
                <Form layout="vertical">
                    <div className="content-block">
                        <AmountSelector
                            label="modal.reserve.amount"
                            amount={this.state.amount}
                            onChange={this.onAmountChanged.bind(this)}
                            asset={assetId}
                            assets={[assetId]}
                            display_balance={balance}
                            tabIndex={1}
                        />
                    </div>
                </Form>
            </Modal>
        );
    }
}

ReserveAssetModal = AssetWrapper(ReserveAssetModal, {
    propNames: ["asset"]
});

export default ReserveAssetModal;
