import { useMemo } from 'react'
import './index.scss'

function Toast(props:any) {
  useMemo(() => {
    if (props.popupShow) {
      setTimeout(() => {
        props.setPopupShow(false)
      }, props.popupTime || 2500)
    }
  }, [props.popupShow])
  return (
    props.popupShow && (
      <div
        className={`global_popup ${props.popupDirection || 'center'}`}
      >
        <span>{props.popupText}</span>
      </div>
    )
  )
}

export default Toast
