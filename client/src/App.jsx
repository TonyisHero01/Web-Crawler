import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Space, RadioGroup, Radio, SideSheet,Input } from '@douyinfe/semi-ui'
import RelationGraph from 'relation-graph-react'
import { useQuery, gql } from '@apollo/client'
import { Typography, List } from '@douyinfe/semi-ui'

const client = new ApolloClient({
  uri: '/dev/graphql',
  cache: new InMemoryCache(),
});


function Index() {
  const { Title } = Typography

  const [visible, setVisible] = useState(false)
  const [nodes, setNodes] = useState([{ id: 'root', opacity: 0 }])
  const [lines, setLines] = useState([])
  const [id, setId] = useState('')
  const [value, setValue] = useState(0)

  const changeMode = (mode,url,depth) =>{
    fetch("/dev/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode:mode,
        url:url,
        depth:depth
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data)
      })
      .catch((error) => {
        console.error("Error:", error)
      });
  }

  const onChange = (e) => {
    let url = document.getElementById("url")
    let depth = document.getElementById("depth")
    setValue(e.target.value)
    changeMode(e.target.value,url.value, depth.value)
  }

  const change = () => {
    setVisible(!visible)
  }

  const graphRef = useRef(null)
  const graphOptions = {
    defaultNodeBorderWidth: 0,
    defaultNodeColor: 'rgba(238, 178, 94, 1)',
    defaultLineShape: 1,
    layouts: [
      {
        layoutName: 'center'
      }
    ],
    defaultJunctionPoint: 'border'
  }

  const getPagesQuery = gql`
    {
      pages {
        url,_id,from,title,links,time
      }
    }
  `

  const onNodeClick = (nodeObject) => {
    setId(nodeObject.id)
    change()
  }

  const showGraph = async () =>{
    const __graph_json_data = {
      nodes: nodes,
      lines: lines
    }

    const graphInstance = graphRef.current?.getInstance()
    if (graphInstance) {
      await graphInstance.setJsonData(__graph_json_data)
      await graphInstance.moveToCenter()
      await graphInstance.zoomToFit()
    }
  }

  useEffect(()=>{
    showGraph()
  },[
    nodes,lines
  ])

  setInterval(()=>{
    refetch()
  },10000)


  const { data, refetch } = useQuery(getPagesQuery,{
  })

  useEffect(()=>{
    setNodes(data?.pages.map((item)=>({
      id: item._id,
      text: item.title
    })))
    setLines(data?.pages.filter((item)=>item.from).map((item)=>({
      from: item.from,
      to: item._id
    })))
  }, [data])

  const deatil = useMemo(()=>data?.pages,[data])

  return <>
    <div className="h-screen w-screen p-4">
      <div className="text-9">Tony's Crawling List</div>
      <Space vertical spacing='loose' align='start' className='mt-4'>
        <RadioGroup type='button' onChange={onChange} value={value} aria-label="模式选择">
          <Radio value={1}>Active Mode</Radio>
          <Radio value={0}>InActive Mode</Radio>
        </RadioGroup>
        <Input placeholder='url' id="url"></Input>
        <Input placeholder='depth' id="depth" type='number' min="2"></Input>
      </Space>
      <div className='w-full border border-red border-solid mt-4' style={{height:'calc(100% - 120px)'}}>
        <RelationGraph ref={graphRef} options={graphOptions} onNodeClick={onNodeClick} />
      </div>
    </div>
    <SideSheet title="Node Detail" visible={visible} onCancel={change}>
      {deatil && id.length > 0 && deatil.filter((item) => item?._id === id).map(item=>(
        <>
          <Title>{item.title}</Title>
          <Title heading={5}>{item.url}</Title>
          <Title heading={5}>{item.time.slice(0, 19)}</Title>
          <List
            size="small"
            bordered
            dataSource={item.links}
            renderItem={item => <List.Item>{item}</List.Item>}
          />
        </>
      ))}
    </SideSheet>
  </>
}

function App() {
  return (
    <>
    <ApolloProvider client={client}>
      <Index />
    </ApolloProvider>
  </>
  )
}

export default App
