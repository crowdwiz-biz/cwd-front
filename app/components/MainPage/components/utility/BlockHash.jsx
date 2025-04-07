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
        });
    }

    handleKeyDown(link) {
        if (event.key === "Enter") {
            this.handleEnter(link);
        }
    }

    handleEnter(link) {
        if (!link) {
            return;
        }
        window.location.href = `${link}`;
    }

    render() {
        let { blockHash } = this.state;
        let href = "/hash/";
        if (blockHash.length < 40) {
            href = "/profile/";
        }


        return (
            <section className="block-hash__container">

                <div className="block-hash__inner search-wrapper">
                    <input
                        className="cwd-common__input search"
                        ref="blockHashInput"
                        type="text"
                        placeholder={counterpart.translate("explorer.blocks.block_hash_title")}
                        onChange={this.handleBlockHash.bind(this)}
                        onKeyDown={() => this.handleKeyDown(href + blockHash)}
                    />
                </div>
            </section>
        );
    }
}

export default BlockHash;
