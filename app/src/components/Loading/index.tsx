import { useMemo } from 'react'
import './index.scss'

function Loading(props:any) {
  const cls = useMemo(() => {
    let styleClass = props.isCenter ? 'lds-spinner-center' : ''
    return styleClass
  }, [props])
  return (
    <div className={`pb-lds-spinner lds-spinner-center`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export default Loading
