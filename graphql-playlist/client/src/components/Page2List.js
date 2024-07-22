import React, { Component } from 'react';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';
import { Graph } from 'react-d3-graph';

// 定义 GraphQL 查询
const getPagesQuery = gql`
    {
        pages {
            title
            time
            url
            id
            outgoing_links {
                id
                url
            }
        }
    }
`;

class Page2List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPage: null, // 用于存储当前选中的页面详情
        };
        this.graphRef = React.createRef(); // 创建 ref
    }

    handleNodeClick = (nodeId) => {
        const { data } = this.props;
        const { pages } = data;

        // 查找被点击节点对应的页面数据
        const selectedPage = pages.find(page => page.url === nodeId);

        // 更新 state 中的 selectedPage
        this.setState({ selectedPage });
    };

    render() {
        const { data } = this.props;
        const { selectedPage } = this.state;

        // 在数据加载完成前显示加载状态
        if (data.loading) {
            return <div>Loading...</div>;
        }

        // 数据加载完成后，提取页面数据并准备图形数据
        const pages = data.pages;
        const nodes = [];
        const links = [];
        
        // 添加页面节点和链接
        pages.forEach(page => {
            // 添加页面节点
            nodes.push({ id: page.url, label: page.title });
            // 添加页面的出站链接节点和链接
            page.outgoing_links.forEach(link => {
                // 添加链接节点
                nodes.push({ id: link.url, label: link.url });
                // 添加链接
                links.push({ source: page.url, target: link.url });
            });
        });

        // 定义图形配置
        const myConfig = {
            nodeHighlightBehavior: true,
            node: {
                color: 'lightgreen',
                size: 120,
                highlightStrokeColor: 'blue',
            },
            link: {
                highlightColor: 'lightblue',
            },
            // 禁用缩放功能
            zoomable: false,
        };

        return (
            <div style={{ width: '100%', height: '100%', display: 'flex' }}>
                <div style={{ width: '80%', height: '100%' }}>
                    <Graph
                        id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
                        data={{ nodes, links }}
                        config={myConfig}
                        onClickNode={this.handleNodeClick}
                    />
                </div>
                {selectedPage && (
                    <div style={{ width: '20%', height: '100%', position: 'fixed', top: 0, right: 0, padding: '20px', backgroundColor: 'lightgray' }}>
                        <h2>Page Details</h2>
                        <p>Title: {selectedPage.title}</p>
                        <p>URL: {selectedPage.url}</p>
                        <p>Crawled Time: {selectedPage.time}</p>
                        <h3>Outgoing Links</h3>
                        <ul>
                            {selectedPage.outgoing_links.map((link) => (
                                <li key={link.id}>{link.url}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
}

export default graphql(getPagesQuery)(Page2List);
