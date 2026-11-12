
import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'

function App() {
  const [tarefas, setTarefas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState('Média')
  const [status, setStatus] = useState('Pendente')
  const [editando, setEditando] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Buscar tarefas no Supabase
  async function buscarTarefas() {
    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      setErro(error.message)
    } else {
      setTarefas(data)
    }

    setCarregando(false)
  }

  // Carregar tarefas quando abrir o sistema
  useEffect(() => {
    buscarTarefas()
  }, [])

  // Cadastrar ou editar tarefa
  async function salvarTarefa(e) {
    e.preventDefault()

    if (!titulo.trim()) return

    setErro('')

    const dadosTarefa = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      prioridade,
      status
    }

    let error

    if (editando !== null) {
      const resultado = await supabase
        .from('tarefas')
        .update(dadosTarefa)
        .eq('id', editando)

      error = resultado.error
    } else {
      const resultado = await supabase
        .from('tarefas')
        .insert([{
          ...dadosTarefa,
          data: new Date().toISOString().slice(0, 10)
        }])

      error = resultado.error
    }

    if (error) {
      setErro(error.message)
      return
    }

    limparFormulario()
    await buscarTarefas()
  }

  function limparFormulario() {
    setTitulo('')
    setDescricao('')
    setPrioridade('Média')
    setStatus('Pendente')
    setEditando(null)
  }

  function editarTarefa(tarefa) {
    setTitulo(tarefa.titulo)
    setDescricao(tarefa.descricao || '')
    setPrioridade(tarefa.prioridade)
    setStatus(tarefa.status)
    setEditando(tarefa.id)
  }

  // Excluir tarefa do Supabase
  async function excluirTarefa(id) {
    const confirmar = window.confirm('Deseja realmente excluir esta tarefa?')

    if (!confirmar) return

    setErro('')

    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id)

    if (error) {
      setErro(error.message)
      return
    }

    await buscarTarefas()
  }

  const concluidas = tarefas.filter(
    t => t.status === 'Concluída'
  ).length

  const pendentes = tarefas.filter(
    t => t.status === 'Pendente'
  ).length

  function formatarData(data) {
    if (!data) return 'Não informada'

    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  return (
    <main className="container">
      <header className="cabecalho">
        <div>
          <h1>TaskFlow</h1>
          <p>Organize suas tarefas e acompanhe seu progresso.</p>
        </div>
        <span className="logo">✓</span>
      </header>

      <section className="resumo">
        <div className="cartao-resumo">
          <span>Total de tarefas</span>
          <strong>{tarefas.length}</strong>
        </div>
        <div className="cartao-resumo">
          <span>Pendentes</span>
          <strong>{pendentes}</strong>
        </div>
        <div className="cartao-resumo">
          <span>Concluídas</span>
          <strong>{concluidas}</strong>
        </div>
      </section>

      <section className="painel">
        <h2>
          {editando !== null ? 'Editar tarefa' : 'Cadastrar nova tarefa'}
        </h2>

        <form onSubmit={salvarTarefa}>
          <label>Título da tarefa</label>
          <input
            type="text"
            placeholder="Ex.: Estudar programação"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
          />

          <label>Descrição</label>
          <textarea
            placeholder="Descreva os detalhes da tarefa..."
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            rows="3"
          />

          <div className="campos">
            <div>
              <label>Prioridade</label>
              <select
                value={prioridade}
                onChange={e => setPrioridade(e.target.value)}
              >
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
              </select>
            </div>

            <div>
              <label>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option>Pendente</option>
                <option>Em andamento</option>
                <option>Concluída</option>
              </select>
            </div>
          </div>

          <div className="acoes-formulario">
            <button type="submit" className="botao-principal">
              {editando !== null ? 'Salvar alterações' : 'Adicionar tarefa'}
            </button>

            {editando !== null && (
              <button
                type="button"
                className="botao-cancelar"
                onClick={limparFormulario}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      {erro && (
        <p role="alert" style={{ color: 'red' }}>
          Erro: {erro}
        </p>
      )}

      <section className="lista">
        <h2>Minhas tarefas</h2>

        {carregando ? (
          <p>Carregando tarefas...</p>
        ) : tarefas.length === 0 ? (
          <p className="vazio">Nenhuma tarefa cadastrada ainda.</p>
        ) : (
          tarefas.map(tarefa => (
            <article className="tarefa" key={tarefa.id}>
              <div className="tarefa-info">
                <h3>{tarefa.titulo}</h3>
                <p>{tarefa.descricao || 'Sem descrição.'}</p>
                <small>
                  Criada em: {formatarData(tarefa.data)}
                </small>

                <div className="marcadores">
                  <span className={`prioridade ${tarefa.prioridade.toLowerCase()}`}>
                    Prioridade: {tarefa.prioridade}
                  </span>
                  <span className="status">{tarefa.status}</span>
                </div>
              </div>

              <div className="acoes-tarefa">
                <button onClick={() => editarTarefa(tarefa)}>
                  Editar
                </button>
                <button
                  className="excluir"
                  onClick={() => excluirTarefa(tarefa.id)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <footer>
        <p>TaskFlow — Gerenciador de Tarefas</p>
      </footer>
    </main>
  )
}

export default App
