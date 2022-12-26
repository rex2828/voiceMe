import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useWebRTC } from '../../hooks/useWebRTC';
import styles from './Room.module.css';
import { getRoom } from '../../http';
const Room = () => {

  const { id: roomId } = useParams();
  const user = useSelector((state) => state.authSlice.user);
  const { clients, provideRef, handleMute } = useWebRTC(roomId, user);
  const navigate = useNavigate();

  const [room, setRoom] = useState(null)
  const [mute, setMute] = useState(true)

  const handleManualLeave = () => {
    navigate('/rooms')
  }

  useEffect(() => {
    const fetchRoom = async () => {
      const { data } = await getRoom(roomId)
      setRoom(data)
    }
    fetchRoom()
  }, [roomId])

  useEffect(() => {
    handleMute(mute, user.id)
  }, [mute])

  const handleMuteClick = (clientId) => {
    if (clientId !== user.id) return
    setMute((isMute) => !isMute)
  }

  return (
    <div>
      <div className='container'>
        <button onClick={handleManualLeave} className={styles.goBack}>
          <img src='/images/arrow-left.svg' alt='back' />
          <span>All voice rooms</span>
        </button>
      </div>
      <div className={styles.clientsWrap}>
        <div className={styles.header}>
          {room && <h4 className={styles.topic}>{room.topic}</h4>}
          <div className={styles.actions}>
            <button className={styles.actionBtn}>
              <img src="/images/hand.svg" alt="hand-icon" />
            </button>
            <button
              onClick={handleManualLeave}
              className={styles.actionBtn}
            >
              <img src="/images/win.svg" alt="win-icon" />
              <span>Leave quietly</span>
            </button>
          </div>
        </div>
        <div className={styles.clientsList}>
          {
            clients.map((client) => {
              return (
                <div className={styles.client} key={client.id}>
                  <div className={styles.userHead}>
                    <audio ref={(instance) => provideRef(instance, client.id)} autoPlay></audio>
                    <img src={client.avatar} alt='avatar' className={styles.userAvatar} />
                    <button onClick={() => handleMuteClick(client.id)} className={styles.micBtn}>
                      {
                        client.muted ?
                          <img
                            className={styles.micImg}
                            src="/images/mic-off.svg"
                            alt="mic-off"
                          /> :
                          <img
                            className={styles.micImg}
                            src="/images/mic-on.svg"
                            alt="mic-on"
                          />
                      }
                    </button>
                  </div>

                  <h5>{client.name}</h5>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default Room