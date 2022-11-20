import React from "react";
import NewIcon from "../NewIcon/NewIcon";
import AssetSelector from "../Utility/AssetSelector";
import SettingsActions from "actions/SettingsActions";
import Translate from "react-translate-component";
import counterpart from "counterpart";

import {Modal, Button} from "crowdwiz-ui-modal";

export default class QuoteSelectionModal extends React.Component {
    constructor() {
        super();

        this.state = {
            backingAsset: "",
            error: false,
            valid: false
        };
    }

    _onMoveUp(quote) {
        const idx = this.props.quotes.findIndex(q => q === quote);
        SettingsActions.modifyPreferedBases({
            oldIndex: idx,
            newIndex: idx - 1
        });
    }

    _onMoveDown(quote) {
        const idx = this.props.quotes.findIndex(q => q === quote);
        SettingsActions.modifyPreferedBases({
            oldIndex: idx,
            newIndex: idx + 1
        });
    }

    _onRemove(quote) {
        const idx = this.props.quotes.findIndex(q => q === quote);
        if (idx >= 0) {
            SettingsActions.modifyPreferedBases({
                remove: idx
            });
        }
    }

    _onAdd(quote) {
        const idx = this.props.quotes.findIndex(q => q === quote.get("symbol"));
        if (idx === -1) {
            SettingsActions.modifyPreferedBases({
                add: quote.get("symbol")
            });
        }
    }

    _onInputBackingAsset(asset) {
        this.setState({
            backingAsset: asset.toUpperCase(),
            error: null
        });
    }

    _onFoundBackingAsset(asset) {
        if (asset) {
            if (!this.props.quotes.includes(asset.get("symbol"))) {
                this.setState({isValid: true});
            } else {
                this.setState({
                    error: "Asset already being used",
                    isValid: false
                });
            }
        }
    }

    render() {
        const {error} = this.state;
        const quoteCount = this.props.quotes.size;
        return (
            <Modal
                title={counterpart.translate("exchange.quote_selection")}
                closable={false}
                visible={this.props.visible}
                id="quote_selection"
                overlay={true}
                onCancel={this.props.hideModal}
                footer={[
                    <Button onClick={this.props.hideModal}>
                        {counterpart.translate("modal.close")}
                    </Button>
                ]}
            >
                <section className="no-border-bottom">
                    <table className="table">
                        <thead>
                            <tr>
                                <th />
                                <th>
                                    <Translate content="account.quote" />
                                </th>
                                <th style={{textAlign: "center"}}>
                                    <Translate content="exchange.move_down" />
                                </th>
                                <th style={{textAlign: "center"}}>
                                    <Translate content="exchange.move_up" />
                                </th>
                                <th style={{textAlign: "center"}}>
                                    <Translate content="exchange.remove" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.quotes.map((q, idx) => {
                                return (
                                    <tr key={q}>
                                        <td>{idx + 1}</td>
                                        <td>{q}</td>
                                        <td className="text-center">
                                            {idx !== quoteCount - 1 && (
                                                <NewIcon
                                                    iconClass={"clickable"}
                                                    iconWidth={16}
                                                    iconHeight={16}
                                                    iconName={"chevron-down"}
                                                    onClick={this._onMoveDown.bind(
                                                        this,
                                                        q
                                                    )}
                                                />
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {idx !== 0 && (
                                                <NewIcon
                                                    iconClass={
                                                        "clickable rotate180"
                                                    }
                                                    iconWidth={16}
                                                    iconHeight={16}
                                                    iconName={"chevron-down"}
                                                    onClick={this._onMoveUp.bind(
                                                        this,
                                                        q
                                                    )}
                                                />
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {quoteCount > 1 && (
                                                <NewIcon
                                                    iconClass={"clickable"}
                                                    iconWidth={16}
                                                    iconHeight={16}
                                                    iconName={"cross-circle"}
                                                    onClick={this._onRemove.bind(
                                                        this,
                                                        q
                                                    )}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <br />

                    <div>
                        <AssetSelector
                            label="exchange.custom_quote"
                            onChange={this._onInputBackingAsset.bind(this)}
                            asset={this.state.backingAsset}
                            assetInput={this.state.backingAsset}
                            tabIndex={1}
                            style={{width: "100%", paddingRight: "10px"}}
                            onFound={this._onFoundBackingAsset.bind(this)}
                            onAction={this._onAdd.bind(this)}
                            action_label="exchange.add_quote"
                            disableActionButton={!!error}
                            noLabel
                        />
                        <div className="error-area">{error}</div>
                    </div>
                </section>
            </Modal>
        );
    }
}
