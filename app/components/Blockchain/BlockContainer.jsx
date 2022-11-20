import React from "react";
import BlockchainStore from "stores/BlockchainStore";
import AltContainer from "alt-container";
import Block from "./Block";
import ls from "common/localStorage";

let ss = new ls("__graphene__");

class BlockContainer extends React.Component {

    constructor(props, context) {
        super(props);

        this.state = {
            height: 0,
        };
    }

    componentDidMount() {
        this.updateHeight();
    }

    updateHeight() {
        let height = this.props.match.params.height;
        if (height != parseInt(height)) {

            let apiUrl = ss.get("serviceApi");
            let structureUrl = apiUrl + "/tbhash/" + height;

            fetch(structureUrl)
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        height: parseInt(data)
                    });
                })
        }
        else {
            this.setState({
                height: parseInt(height)
            });      
        }
    }
    render() {
        let height = this.state.height;
        if (this.props.match.params.height == parseInt(this.props.match.params.height)) {
            height = parseInt(this.props.match.params.height);
        }
        
        let txIndex = this.props.match.params.txIndex
            ? parseInt(this.props.match.params.txIndex)
            : 0;

        return (
            height != 0 ?
            <AltContainer
                stores={[BlockchainStore]}
                inject={{
                    blocks: () => {
                        return BlockchainStore.getState().blocks;
                    }
                }}
            >
                <Block
                    {...this.props}
                    height={height}
                    scrollToIndex={txIndex}
                />
            </AltContainer> : null
        );
    }
}

export default BlockContainer;
