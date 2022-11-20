import React from "react";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import { Link } from "react-router-dom";


class BlockHash extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            blockHash: ""
        };
    }

    handleBlockHash() {
        let blockHash = this.refs.blockHashInput.value;

        this.setState({
            blockHash: blockHash
        })
    }

    render() {
        let { blockHash } = this.state;
        let href = "/hash/";
        if (blockHash.length < 40) {
            href = "/profile/"; 
        } 


        return (
            <section className="block-hash__container">
                <Translate
                    className="explorer__subtitle"
                    content="explorer.blocks.block_hash_title"
                />

                <div className="block-hash__inner">
                    <input
                        className="cwd-common__input"
                        ref="blockHashInput"
                        type="text"
                        placeholder={counterpart.translate("explorer.blocks.enter_hash")}
                        onChange={this.handleBlockHash.bind(this)}
                    />

                    <Link
                        className="cwd-btn__action-btn noselect"
                        to={href + blockHash}
                    >
                        <Translate content="explorer.block.go_to_btn" />
                    </Link>
                </div>
            </section>
        );
    }
}

export default BlockHash;