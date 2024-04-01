import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const App = () => {
  const [url, setUrl] = useState('localhost'); // Estado para armazenar a URL do servidor
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idAlunoEditando, setIdAlunoEditando] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [textoBotao, setTextoBotao] = useState('Gravar');
  const [loading, setLoading] = useState(true);

  // Função para converter a data do formato do usuário para o formato da API
  const converterParaFormatoApi = (dataUsuario) => {
    const [dia, mes, ano] = dataUsuario.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  };
  
  // Função para converter a data do formato da API para o formato do usuário
  const converterParaFormatoUsuario = (dataApi) => {
    if (!Array.isArray(dataApi) || dataApi.length !== 3) {
      return ''; 
    }
  
    const [ano, mes, dia] = dataApi;
    const mesFormatado = mes.toString().padStart(2, '0');
    return `${dia}/${mesFormatado}/${ano}`;
  };
  

  // Função para buscar os alunos do servidor
  const buscarAluno = async () => {
    try {
      // Espera 1 segundo antes de fazer a requisição para simular carregamento
      setTimeout(async () => {
        const response = await axios.get(`http://${url}:8080/alunos`);
        setAlunos(response.data);
        setLoading(false); // Define loading como false após obter os dados
      }, 1000);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setLoading(false); // Define loading como false em caso de erro
    }
  };

  // Função para cadastrar um novo aluno
  const cadastrarAluno = async () => {
    try {
      // Verifica se todos os campos foram preenchidos
      if (!nome || !idade || !dataNascimento) {
        console.error('Por favor, preencha todos os campos antes de cadastrar.');
        return;
      }

      const dataFormatada = converterParaFormatoApi(dataNascimento);

      if (modoEdicao && idAlunoEditando) {
        // Atualiza um aluno existente se estiver no modo de edição
        const response = await axios.put(`http://${url}:8080/alunos/${idAlunoEditando}`, {
          nome,
          idade: parseInt(idade),
          dataNascimento: dataFormatada,
        });

        console.log('Aluno atualizado com sucesso:', response.data);
        setModoEdicao(false);
        setIdAlunoEditando(null);
        setTextoBotao('Gravar');
      } else {
        // Cadastra um novo aluno
        const response = await axios.post(`http://${url}:8080/alunos`, {
          nome,
          idade: parseInt(idade),
          dataNascimento: dataFormatada,
        });

        console.log('Aluno cadastrado com sucesso:', response.data);
      }

      buscarAluno(); // Após cadastrar/atualizar, busca novamente os alunos
      setNome('');
      setIdade('');
      setDataNascimento('');
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
    }
  };
  
  // Função para cancelar a edição de um aluno
  const cancelarEdicao = () => {
    setTextoBotao('Gravar'); 
    setEditMode(false);
  };
  
  // Função para editar um aluno
  const editarAluno = (id) => {
    setEditMode(true);

    const alunoEditando = alunos.find((aluno) => aluno.id === id);
  
    if (alunoEditando) {
      setModoEdicao(true);
      setIdAlunoEditando(id);
      setNome(alunoEditando.nome);
      setIdade(alunoEditando.idade.toString());
      setDataNascimento(converterParaFormatoUsuario(alunoEditando.dataNascimento, 'dd/MM/yyyy'));
      setTextoBotao('Gravar Edição'); 
    }
  };
  
  // Função para excluir um aluno
  const excluirAluno = async (id) => {
    try {
      // Mostra um alerta para confirmar a exclusão
      Alert.alert(
        'Confirmação',
        'Tem certeza que deseja excluir este aluno?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            onPress: async () => {
              const response = await axios.delete(`http://${url}:8080/alunos/${id}`);
              console.log('Aluno excluído com sucesso:', response.data);
              buscarAluno(); // Após excluir, busca novamente os alunos
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
    }
  };

  useEffect(() => {
    buscarAluno(); // Quando o componente for montado, busca os alunos
  }, []);

  // Se estiver carregando, exibe um indicador de atividade
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('./src/img/Aluno.png')}
        style={styles.headerImage}
      />
      <Text style={styles.title}>APP Cadastro de Aluno</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={nome}
          onChangeText={(text) => setNome(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Idade"
          value={idade}
          onChangeText={(text) => setIdade(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Data de Nascimento (DD/MM/AAAA)"
          value={dataNascimento}
          onChangeText={(text) => setDataNascimento(text)}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={cadastrarAluno}
        >
          <Text style={styles.buttonText}>{textoBotao}</Text>
        </TouchableOpacity>
      </View>
  
      <View style={styles.horizontalLine} />
  
      <FlatList
        data={alunos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.alunoItem}>
            <View style={styles.dadosContainer}>
              <Text>{item.nome}</Text>
              <Text>{item.idade} anos</Text>
              <Text>Data de Nascimento: {converterParaFormatoUsuario(item.dataNascimento, 'dd/MM/yyyy')}</Text>
            </View>
            <View style={styles.botoesContainer}>
              {editMode ? (
                // Modo de edição
                <TouchableOpacity
                  style={styles.cancelarButton}
                  onPress={cancelarEdicao}
                >
                  <Image
                      source={require('./src/img/IconCancela.jpg')}
                      style={styles.icon}
                    />
                </TouchableOpacity>
              ) : (
                // Modo padrão
                <>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editarAluno(item.id)}
                  >
                    <Image
                      source={require('./src/img/IconEdit.png')}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => excluirAluno(item.id)}
                  >
                    <Image
                      source={require('./src/img/IconExclui.png')}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  headerImage: {
    height: 250,
    width: 400,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  horizontalLine: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  formContainer: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
  },
  alunoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dadosContainer: {
    flex: 3,
  },
  botoesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  editButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
  },
  icon: {
    width: 48, 
    height: 48,
  },
  cancelarButton: {
    marginLeft: 10,
    marginRight: 10,
    padding: 5,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
