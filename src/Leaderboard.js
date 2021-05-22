import React, { useState, useEffect } from 'react'
import axios from 'axios'

const URL = 'https://raw.githubusercontent.com/ChrisWalley/Runtime-Terror---Snake-Game-Viewer/main/db.json'

const Leaderboard = () => {
    const [players, setPlayers] = useState([])

    useEffect(() => {
        getData()
    }, [])

    function handleUsernameClick(e) {
    console.log(e);
    }

    function handleScoreClick(e) {
    console.log(e);
    }

    const getData = async () => {

        const response = await axios.get(URL)
        setPlayers(response.data)
    }

    const removeData = (id) => {

        axios.delete(`${URL}/${id}`).then(res => {
            const del = players.filter(player => id !== player.id)
            setPlayers(del)
        })
    }

    const renderHeader = () => {
        let headerElement = ['name', 'score','division']
        return headerElement.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }

    const renderBody = () => {
        return players && players.map(({ id, username, score, division }) => {
            return (
                <tr key={id}>
                    <td className='opration'>
                        <a className='button' href = "" onClick={() =>handleUsernameClick(division)}>{username}</a>
                    </td>
                    <td className='opration'>
                        <a className='button' href = "" onClick={() =>handleScoreClick(username)}>{score}</a>
                    </td>
                    <td>{division}</td>
                </tr>
            )
        })
    }

    return (
        <>
            <h1 id='title'>Leaderboard</h1>
            <table id='player'>
                <thead>
                    <tr>{renderHeader()}</tr>
                </thead>
                <tbody>
                    {renderBody()}
                </tbody>
            </table>
        </>
    )
}


export default Leaderboard