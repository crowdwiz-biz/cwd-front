import React from "react";
import BlockchainStore from "stores/BlockchainStore";
import AltContainer from "alt-container";
import Explorer from "./Explorer";

class BlocksContainer extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <AltContainer
                stores={[BlockchainStore]}
                inject={{
                    latestBlocks: () => {
                        return BlockchainStore.getState().latestBlocks;
                    },
                    latestTransactions: () => {
                        return BlockchainStore.getState().latestTransactions;
                    }
                }}
            >
                <Explorer />
            </AltContainer>
        );
    }
}

export default BlocksContainer;
