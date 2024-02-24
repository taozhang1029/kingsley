---
sidebar: auto
---

# 如何搭建一个自己的大模型服务？

## 一、Ollama 是什么?

官方网站：[https://ollama.ai/](https://ollama.ai/)  
GitHub：[https://github.com/ollama/ollama](https://github.com/ollama/ollamahttps://github.com/ollama/ollama)  
Star数：39K+

Ollama 是一个强大的框架，通过简单的安装指令，可以让用户执行一条命令就在本地运行开源大型语言模型。
> Ollama 将模型权重、配置和数据捆绑到一个包中，定义成 Modelfile，它优化了设置和配置细节，包括 GPU 使用情况

### 1、Ollama的核心功能
- 易于安装和使用：Ollama 支持 macOS、Windows 和 Linux，提供了简洁明了的安装和运行指令，让用户无需深入了解复杂的配置即可启动和运行。
- 丰富的模型库：通过Ollama，用户可以访问和运行包括 Llama 2、Mistral 和 Dolphin Phi 在内的多种大型语言模型。这为开发者和研究者提供了极大的便利。
- 高度可定制：Ollama 允许用户通过 Modelfile 定义和创建自定义模型，满足特定应用场景的需求。
- 优化的性能：即使在普通的个人电脑上，Ollama 也能通过优化运行效率，支持运行较小的模型，为用户提供实验和测试的环境。

### 2、**Ollama的独特之处**

与市面上其他相似工具相比，Ollama 最大的特色在于它的易用性和灵活性。用户不仅可以通过命令行界面快速运行模型，还可以选择图形用户界面（GUI）进行交互，如 Ollama WebUI 和 macOS 的原生应用 Ollamac 等，极大地提高了用户体验。

## 二、基本使用

### 1、安装

Ollama极大的简化了安装的过程，并提供了多种选择。 支持的平台包括：macOS, Linux, and Windows (preview)，并提供了docker 镜像。

- Mac：
  使用Mac可以[下载安装包](https://ollama.ai/download)，下载完成后直接安装即可。

- Windows：下载预览版或通过相同的渠道获取最新版本，根据下载的安装程序指引完成安装。

- Linux：直接执行以下命令可以完成默认安装。
    ```shell
    curl -fsSL https://ollama.com/install.sh | sh
    ```

- Docker：Ollama也提供了官方的Docker镜像
  ```shell
  docker pull ollama/ollama
  ```

### 2、运行模型
- 下载模型：ollama pull <模型名>
- 下载并运行模型：ollama run <模型名>
- 可以通过创建Modelfile并使用 ollama create <模型名> -f ./Modelfile 来创建自定义模型

安装完成后，打开终端（macOS）或命令提示符（Windows），输入命令来下载并运行一个模型，例如 Llama 2

```shell
ollama run llama2
```

Docker运行模型
```shell
docker run -it ollama/ollama run llama2
```

Ollama支持多种开源模型，可通过 [ollama.com/library](https://ollama.com/library) 查看所有可用的模型

其中部分模型：?B = 10x?亿参数

| Model              | Parameters | Size  | Download                       |
|--------------------|------------|-------|--------------------------------|
| Llama 2            | 7B         | 3.8GB | `ollama run llama2`            |
| Mistral            | 7B         | 4.1GB | `ollama run mistral`           |
| Dolphin Phi        | 2.7B       | 1.6GB | `ollama run dolphin-phi`       |
| Phi-2              | 2.7B       | 1.7GB | `ollama run phi`               |
| Neural Chat        | 7B         | 4.1GB | `ollama run neural-chat`       |
| Starling           | 7B         | 4.1GB | `ollama run starling-lm`       |
| Code Llama         | 7B         | 3.8GB | `ollama run codellama`         |
| Llama 2 Uncensored | 7B         | 3.8GB | `ollama run llama2-uncensored` |
| Llama 2 13B        | 13B        | 7.3GB | `ollama run llama2:13b`        |
| Llama 2 70B        | 70B        | 39GB  | `ollama run llama2:70b`        |
| Orca Mini          | 3B         | 1.9GB | `ollama run orca-mini`         |
| Vicuna             | 7B         | 3.8GB | `ollama run vicuna`            |
| LLaVA              | 7B         | 4.5GB | `ollama run llava`             |

> Note: You should have at least 8 GB of RAM available to run the 7B models, 16 GB to run the 13B models, and 32 GB to run the 33B models.  
> 7B模型需要8G内存，13B模型需要16G内存，33B模型需要32G内存。

除了简单的启动模型外，Ollama 可以通过编写 Modelfile 来导入更多的自定义模型， Ollama具备灵活的扩展性，它支持和很多工具集成，除了命令行的使用方式，可以通过配合UI界面，简单快速的打造一个类ChatGPT应用。

### 3、调用模型
见[实践-调用模型](./ollama.md#3-调用模型)

## 三、实践
以Linux系统，使用Google开源模型**Gemma**为例，使用Ollama搭建一个类似于ChatGPT的应用

### 1. 安装Ollama
```shell
[root@centos ~]# curl -fsSL https://ollama.com/install.sh | sh
>>> Downloading ollama...
######################################################################## 100.0%#=#=-#  #                                                                     
>>> Installing ollama to /usr/local/bin...
>>> Creating ollama user...
>>> Adding ollama user to render group...
>>> Adding current user to ollama group...
>>> Creating ollama systemd service...
>>> Enabling and starting ollama service...
Created symlink /etc/systemd/system/default.target.wants/ollama.service → /etc/systemd/system/ollama.service.
>>> The Ollama API is now available at 127.0.0.1:11434.
>>> Install complete. Run "ollama" from the command line.
WARNING: No NVIDIA GPU detected. Ollama will run in CPU-only mode.
```

从日志可以看出ollama自动启动了，安装脚本会自动检测GPU，如果存在则会自动安装CUDA及驱动，在调用模型时会使用GPU加速。

安装完成后会创建了服务，可以通过命令查看服务状态
```shell
[root@centos ~]# systemctl status ollama
● ollama.service - Ollama Service
   Loaded: loaded (/etc/systemd/system/ollama.service; enabled; vendor preset: disabled)
   Active: active (running) since Thu 2024-02-23 23:00:28 CST; 1h 11min ago
 Main PID: 372779 (ollama)
    Tasks: 10 (limit: 48280)
   Memory: 378.6M
   CGroup: /system.slice/ollama.service
           └─372779 /usr/local/bin/ollama serve

2月 22 23:00:37 centos ollama[372779]: time=2024-02-23T23:00:37.243+08:00 level=INFO source=gpu.go:265 msg="Searching for GPU management library libnvidia-ml.so"
2月 22 23:00:37 centos ollama[372779]: time=2024-02-23T23:00:37.256+08:00 level=INFO source=gpu.go:311 msg="Discovered GPU libraries: []"
2月 22 23:00:37 centos ollama[372779]: time=2024-02-23T23:00:37.256+08:00 level=INFO source=gpu.go:265 msg="Searching for GPU management library librocm_smi64.so"
2月 22 23:00:37 centos ollama[372779]: time=2024-02-23T23:00:37.256+08:00 level=INFO source=gpu.go:311 msg="Discovered GPU libraries: []"
2月 22 23:00:37 centos ollama[372779]: time=2024-02-23T23:00:37.256+08:00 level=INFO source=cpu_common.go:18 msg="CPU does not have vector extensions"
2月 22 23:00:37 centos ollama[372779]: time=2024-02-23T23:00:37.256+08:00 level=WARN source=gpu.go:128 msg="CPU does not have AVX or AVX2, disabling GPU support."
2月 22 23:00:37 centos ollama[372779]: time=2024-02-23T23:00:37.256+08:00 level=INFO source=routes.go:1042 msg="no GPU detected"
2月 22 23:51:58 centos ollama[372779]: [GIN] 2024/02/22 - 23:51:58 | 200 |      92.267µs |       127.0.0.1 | HEAD     "/"
2月 22 23:51:58 centos ollama[372779]: [GIN] 2024/02/22 - 23:51:58 | 200 |     530.854µs |       127.0.0.1 | GET      "/api/tags"
2月 22 23:59:45 centos ollama[372779]: [GIN] 2024/02/22 - 23:59:45 | 200 |      42.612µs |       127.0.0.1 | HEAD     "/"
```

### 2. 安装模型
例如 Gemma
> 北京时间2月21日晚21点，美国科技巨头谷歌（Google）宣布推出全球性能最强大、轻量级的开源模型系列Gemma，分为2B（20亿参数）和7B（70亿）两种尺寸版本，2B版本甚至可直接在笔记本电脑上运行。  
> 谷歌表示，Gemma采用与 Gemini 模型相同的研究和技术，由Google DeepMind 和谷歌其他团队开发，专为负责任的 AI开发而打造。谷歌声称，Gemma 模型18个语言理解、推理、数学等关键基准测试中，有11个测试分数超越了Meta Llama-2等更大参数的开源模型。   
> 平均分数方面，Gemma -7B 的基准测试平均分高达56.4，远超过Llama-13B（52.2）、Mistral-7B（54.0），成为目前全球最强大的开源模型。  
> 模型架构方面，Gemma基于谷歌Gemini模型以及Transformer自注意力机制的深度学习技术研发，Gemma 2B 和 7B 分别针对来自网络文档、数学和代码的 2T 和 6T 规模英文标注数据进行训练。与Gemini 不同，这些模型不是多模式的，也没有针对多语言任务的最先进性能进行训练。
> 不仅如此，Gemma还使用了改进后的多头注意力、RoPE嵌入、GeGLU激活函数等新的技术，旨在文本领域实现通用能力，同时具备最先进的理解和推理技能。   
> 性能表现方面，根据技术文件，Gemma在MMLU、MBPP等18个基准测试中，有11个测试结果超越了Llama-13B或Mistral-7B等模型。  
> 自研芯片方面，谷歌Gemma使用自研 AI 加速芯片TPUv5e进行训练。其中7B模型在16个Pods上训练，2B模型在2个Pods上训练，每个 Pod 可占用的 256 个芯片更少，v5e 经过优化，可以成为转换器、文本到图像和卷积神经网络 (CNN) 训练、微调和服务的最大价值产品。 而通过TPUv5e，Gemma模型可在文本领域实现强大的通用能力，同时具备最先进的理解和推理技能。  
> 谷歌今天还宣布与英伟达（NVIDIA）展开合作。这意味着，Gemma不止使用TPUv5e芯片，而且使用NVIDIA GPU 来优化 Gemma 模型。

[谷歌技术博客——gemma模型](https://blog.google/technology/developers/gemma-open-models/)  

[gemma模型论文原文](https://storage.googleapis.com/deepmind-media/gemma/gemma-report.pdf)

安装并运行gemma模型
```shell
[root@centos ~]# ollama run gemma
pulling manifest 
pulling bfd13bfe963d... 100% ▕█████████████████████████████████████████████████████████████████████████████████████████████████████▏ 1.4 GB                         
pulling 097a36493f71... 100% ▕█████████████████████████████████████████████████████████████████████████████████████████████████████▏ 8.4 KB                         
pulling 109037bec39c... 100% ▕████████████████████████████████████████████████████████████████████████████████████████████████████▏  136 B                         
pulling 2490e7468436... 100% ▕█████████████████████████████████████████████████████████████████████████████████████████████████████▏   65 B                         
pulling a157d061c9d8... 100% ▕█████████████████████████████████████████████████████████████████████████████████████████████████████▏  483 B                         
verifying sha256 digest 
writing manifest 
removing any unused layers 
success 
```

### 3. 调用模型
以下测试基于CentOS Stream 8 x86_64，Intel(R) Pentium(R) CPU N3520 @ 2.16GHz 1个物理CPU，4个物理核心，4个逻辑核心，8G 内存的机器
响应耗时较长，建议使用带 Nvidia GPU 的机器

#### a. 使用终端交互调用模型
模型安装成功后终端会自动停留，等待用户输入调用模型，例如输入 Why is the sky blue?

```shell
>>> Why is the sky blue?
The sky appears blue due to Rayleigh scattering. Rayleigh scattering occurs when sunlight interacts with molecules in the Earth's atmosphere. Blue light has 
shorter wavelengths, and therefore, it is scattered more strongly than longer wavelengths. This scattering process results in the blue color we see in the sky.
```
响应结束后会继续停留，等待用户输入（此时Ollama会自动使用 gemma 模型）
```shell
>>> q
Sure, here's a more detailed explanation of why the sky appears blue:

The sky appears blue due to Rayleigh scattering. Rayleigh scattering occurs when sunlight interacts with molecules in the Earth's atmosphere. Rayleigh 
scattered light has shorter wavelengths, and therefore, it is scattered more

strongly than longer wavelengths. This scattering process results in the blue 
color we see in the sky.

**Rayleigh Scattering Mechanism:**

- **Molecules:** The air molecules in the atmosphere are typically much smaller than the wavelengths of visible light.
- **Scattering Particles:** These molecules can scatter light due to their size and shape.
- **Shorter wavelengths (blue light):** Blue light has a shorter wavelength, meaning it is scattered more efficiently than longer wavelengths.

**How Rayleigh Scattering Occurs:**

1. **Sun's Light^C
```

按下 Ctrl + d 或者输入 /bye 可以退出当前交互

```shell
>>> 
Use Ctrl + d or /bye to exit.
>>> /bye
[root@centos ~]# 
```

#### b. 使用http请求调用模型
- 所选模型未安装的情况下，会返回错误信息
```shell
[root@centos ~]# curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt":"Why is the sky blue?"
}'
{"error":"model 'llama2' not found, try pulling it first"}[root@centos ~]# 
```

- 已安装模型的情况下，会返回模型的响应
```shell
[root@centos ~]# curl -X POST http://localhost:11434/api/generate -d '{
  "model": "gemma",
  "prompt":"Why is the sky blue?"
}'
{"model":"gemma","created_at":"2024-02-23T23:38:25.422438065Z","response":"The","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:26.610039619Z","response":" sky","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:27.795347349Z","response":" appears","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:28.983362961Z","response":" blue","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:30.207146032Z","response":" due","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:31.432454703Z","response":" to","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:32.616807021Z","response":" Rayleigh","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:33.907861011Z","response":" scattering","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:35.095711456Z","response":".","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:36.281199208Z","response":" Rayleigh","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:38.830647269Z","response":" scattering","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:40.015457817Z","response":" is","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:41.206717793Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:42.490555606Z","response":" scattering","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:43.679042372Z","response":" of","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:44.865618099Z","response":" light","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:46.153809826Z","response":" by","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:47.355210557Z","response":" tiny","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:48.546049828Z","response":" particles","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:49.735646204Z","response":",","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:50.954860957Z","response":" such","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:52.165038182Z","response":" as","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:53.446598862Z","response":" molecules","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:54.71105372Z","response":" of","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:55.902881234Z","response":" air","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:57.092196163Z","response":" or","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:58.362585233Z","response":" water","done":false}
{"model":"gemma","created_at":"2024-02-23T23:38:59.554851609Z","response":" droplets","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:00.744683052Z","response":",","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:01.933380117Z","response":" that","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:03.146673546Z","response":" are","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:04.40416395Z","response":" smaller","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:05.59720425Z","response":" than","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:07.079864505Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:08.271861374Z","response":" wavelength","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:09.466721681Z","response":" of","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:10.79792228Z","response":" visible","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:12.376858225Z","response":" light","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:13.566501017Z","response":".","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:14.959115579Z","response":"\n\n","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:16.186575492Z","response":"When","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:17.383574249Z","response":" sunlight","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:18.572585592Z","response":" enters","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:19.792258839Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:20.982628996Z","response":" Earth","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:22.185285473Z","response":"'","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:23.476526254Z","response":"s","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:24.66946189Z","response":" atmosphere","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:25.930036363Z","response":",","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:27.130514527Z","response":" it","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:28.327870726Z","response":" interacts","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:29.521801817Z","response":" with","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:30.721074335Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:31.93956596Z","response":" molecules","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:33.139621653Z","response":" of","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:34.330619935Z","response":" air","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:35.608925222Z","response":" at","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:36.857383714Z","response":" different","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:39.395592401Z","response":" wavelengths","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:40.621963476Z","response":" of","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:41.827862926Z","response":" light","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:43.019931638Z","response":" more","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:44.240846471Z","response":" and","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:45.433908815Z","response":" less","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:46.740337802Z","response":" effectively","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:48.035373432Z","response":".","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:49.231345294Z","response":" Blue","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:50.423141644Z","response":" light","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:51.622120019Z","response":" has","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:53.044796847Z","response":" a","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:54.236361682Z","response":" shorter","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:55.42942855Z","response":" wavelength","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:56.694763532Z","response":" than","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:57.965107326Z","response":" longer","done":false}
{"model":"gemma","created_at":"2024-02-23T23:39:59.1600149Z","response":" wavelengths","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:00.432993629Z","response":",","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:01.626395752Z","response":" so","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:02.81809675Z","response":" it","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:04.012890781Z","response":" is","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:05.283936032Z","response":" scattered","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:06.477583036Z","response":" more","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:07.681517867Z","response":" readily","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:08.954987394Z","response":".","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:10.686184734Z","response":" This","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:11.883570453Z","response":" scattering","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:13.189545638Z","response":" effect","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:14.387754757Z","response":" makes","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:15.754916302Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:16.991734562Z","response":" sky","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:18.191521001Z","response":" appear","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:19.423825891Z","response":" blue","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:20.627173745Z","response":".","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:21.849592111Z","response":"\n\n","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:23.044524982Z","response":"The","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:24.243056479Z","response":" intensity","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:25.529685178Z","response":" of","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:26.727994316Z","response":" blue","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:27.948100485Z","response":" light","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:29.179142237Z","response":" varies","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:30.428286129Z","response":" depending","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:31.623416579Z","response":" on","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:32.820700262Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:34.042766537Z","response":" wavelength","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:35.241279807Z","response":",","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:36.438315487Z","response":" with","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:39.085461556Z","response":" blue","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:40.30035219Z","response":" light","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:41.519755162Z","response":" being","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:42.720462501Z","response":" scattered","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:43.917041547Z","response":" more","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:45.112846826Z","response":" intensely","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:46.338107342Z","response":" than","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:47.543090476Z","response":" other","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:48.743143565Z","response":" colors","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:50.050528504Z","response":".","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:51.309012275Z","response":" The","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:52.537469504Z","response":" scattering","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:53.735831238Z","response":" process","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:54.962100025Z","response":" also","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:56.161983363Z","response":" depends","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:57.360180938Z","response":" on","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:58.786483033Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:40:59.987902689Z","response":" size","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:01.187988226Z","response":" and","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:02.527159823Z","response":" density","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:03.724601438Z","response":" of","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:04.926975256Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:06.123099985Z","response":" particles","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:07.350593246Z","response":",","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:08.549147483Z","response":" which","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:10.269205301Z","response":" can","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:11.496768354Z","response":" vary","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:12.726025751Z","response":" with","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:13.925386408Z","response":" altitude","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:15.229147724Z","response":" and","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:16.59195371Z","response":" temperature","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:17.806330795Z","response":".","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:19.031376284Z","response":"\n\n","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:20.231798612Z","response":"The","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:21.429161951Z","response":" scattering","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:22.624471416Z","response":" of","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:23.892944382Z","response":" light","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:25.093719449Z","response":" by","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:26.291643893Z","response":" air","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:27.593476674Z","response":" molecules","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:28.800520426Z","response":" is","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:30.012694538Z","response":" responsible","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:31.25642666Z","response":" for","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:32.459028454Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:33.668202915Z","response":" beautiful","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:34.923726865Z","response":" colors","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:36.155132359Z","response":" of","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:37.538645253Z","response":" the","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:39.93444325Z","response":" sky","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:41.140702038Z","response":",","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:42.355316037Z","response":" especially","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:43.590368313Z","response":" during","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:44.826521645Z","response":" Rayleigh","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:46.045488203Z","response":" season","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:47.257211884Z","response":" (","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:48.486391881Z","response":"typically","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:49.69497861Z","response":" between","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:50.905602317Z","response":" late","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:52.301557891Z","response":" March","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:53.506003847Z","response":" and","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:54.708437582Z","response":" early","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:55.97827547Z","response":" October","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:57.181857683Z","response":").","done":false}
{"model":"gemma","created_at":"2024-02-23T23:41:58.384336573Z","response":"","done":true,"context":[106,1645,108,4385,603,573,8203,3868,235336,107,108,106,2516,108,651,8203,8149,3868,3402,577,153902,38497,235265,153902,38497,603,573,38497,576,2611,731,16791,16071,235269,1582,685,24582,576,2681,689,2003,93625,235269,674,708,9595,1178,573,35571,576,12918,2611,235265,109,4115,33365,30866,573,10379,235303,235256,13795,235269,665,113211,675,573,24582,576,2681,696,2167,95178,576,2611,978,578,2644,16347,235265,7640,2611,919,476,25270,35571,1178,5543,95178,235269,712,665,603,30390,978,22153,235265,1417,38497,4232,3833,573,8203,4824,3868,235265,109,651,18320,576,3868,2611,28361,13478,611,573,35571,235269,675,3868,2611,1855,30390,978,88706,1178,1156,9276,235265,714,38497,2185,1170,12014,611,573,2395,578,11168,576,573,16071,235269,948,798,11633,675,38636,578,5809,235265,109,651,38497,576,2611,731,2681,24582,603,9546,604,573,4964,9276,576,573,8203,235269,5199,2290,153902,3891,591,134508,1865,5245,4482,578,4061,5424,846,107,108],"total_duration":214178475698,"load_duration":818348,"prompt_eval_duration":1215133000,"eval_count":169,"eval_duration":212961659000}
[root@centos ~]# 
```
Ollama支持中文，只要模型支持即可，如gemma

```shell
[root@centos ~]# curl -X POST http://localhost:11434/api/generate -d '{
  "model": "gemma",
  "prompt":"Ollama是什么"
}'
{"model":"gemma","created_at":"2024-02-23T23:53:18.438430943Z","response":"O","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:20.306754636Z","response":"llama","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:21.872982645Z","response":"是一种","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:23.394468881Z","response":"毛","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:24.580151236Z","response":"发","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:25.841448321Z","response":"羊","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:27.027458693Z","response":"、","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:28.242757204Z","response":"毛","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:29.427961445Z","response":"耳","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:30.614486231Z","response":"和","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:31.803970791Z","response":"皮","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:33.011884502Z","response":"膜","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:34.205697105Z","response":"动物","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:35.392907496Z","response":"，","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:36.732137149Z","response":"一种","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:38.00120968Z","response":"类似","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:40.470127318Z","response":"绵","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:41.655518997Z","response":"羊","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:42.854991517Z","response":"但","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:44.040494148Z","response":"更","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:45.254319906Z","response":"轻","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:46.441049964Z","response":"盈","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:47.690611513Z","response":"的","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:48.972598574Z","response":"动物","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:50.167626351Z","response":"。","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:51.355947949Z","response":"它","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:52.602895779Z","response":"是一種","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:53.79222356Z","response":"原","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:54.990817Z","response":"住民","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:56.179546607Z","response":"非洲","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:57.957267739Z","response":"的","done":false}
{"model":"gemma","created_at":"2024-02-23T23:53:59.147005125Z","response":"草","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:00.338757254Z","response":"食","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:01.637633034Z","response":"動物","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:02.833790042Z","response":"，","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:04.022679248Z","response":"棲","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:05.241154876Z","response":"息","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:06.429840216Z","response":"於","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:07.616707408Z","response":"非洲","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:08.858805282Z","response":"南部","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:10.080423419Z","response":"和","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:11.27847541Z","response":"西","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:12.466438977Z","response":"非","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:13.763634236Z","response":"地區","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:14.956147786Z","response":"的","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:16.152073771Z","response":"沙漠","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:17.386649349Z","response":"和","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:18.576942081Z","response":"稀","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:19.825907233Z","response":"疏","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:21.275884651Z","response":"草原","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:22.544039439Z","response":"。","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:23.731715416Z","response":"\n\n","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:24.922203267Z","response":"O","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:26.215992907Z","response":"llama","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:27.410126868Z","response":" ","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:28.601942717Z","response":"是一種","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:29.870577431Z","response":"雜","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:31.062848413Z","response":"交","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:32.261810071Z","response":"種","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:33.453553092Z","response":"動物","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:34.670011266Z","response":"，","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:35.869123835Z","response":"它","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:37.077925206Z","response":"有","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:39.708418895Z","response":"象","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:40.96774619Z","response":"徵","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:42.19193265Z","response":"性","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:43.383843982Z","response":"毛","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:44.576325876Z","response":"髮","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:45.770252502Z","response":"和","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:46.993239604Z","response":"角","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:48.187507617Z","response":"，","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:49.378503989Z","response":"但","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:50.664563507Z","response":"卻","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:51.983645677Z","response":"沒有","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:53.192876381Z","response":"象","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:54.415830628Z","response":"徵","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:55.705716255Z","response":"性的","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:57.298583823Z","response":"牙","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:58.527725815Z","response":"齒","done":false}
{"model":"gemma","created_at":"2024-02-23T23:54:59.721602054Z","response":"或","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:00.914019771Z","response":"牙","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:02.19414695Z","response":"周","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:03.487507676Z","response":"。","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:04.682077895Z","response":"牠","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:05.915721834Z","response":"們","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:07.141476567Z","response":"有","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:08.337551003Z","response":"很","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:09.536117599Z","response":"強","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:10.733584496Z","response":"的","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:11.956818977Z","response":"腿","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:13.202255859Z","response":"部","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:14.396405684Z","response":"，","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:15.591150659Z","response":"可以","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:16.785374248Z","response":"奔跑","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:18.074637978Z","response":"很","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:19.272431297Z","response":"快","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:20.630925081Z","response":"。","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:21.857753941Z","response":" O","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:23.132213102Z","response":"llama","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:24.397628063Z","response":" 在","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:25.594022598Z","response":"非洲","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:26.790140174Z","response":"傳統","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:28.012818577Z","response":"文化","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:29.207139126Z","response":"中","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:30.415373007Z","response":"具有","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:31.617761357Z","response":"重要的","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:32.931401085Z","response":"地位","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:34.145406986Z","response":"，","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:35.388356088Z","response":"牠","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:36.583606056Z","response":"被","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:37.808838324Z","response":"用","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:40.379914852Z","response":"於","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:41.57432972Z","response":"紡","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:42.818193181Z","response":"織","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:44.013520297Z","response":"衣服","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:45.289930565Z","response":"、","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:46.493841215Z","response":"製造","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:47.805254018Z","response":"家具","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:49.004140856Z","response":"和","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:50.201259504Z","response":"其他","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:51.400708035Z","response":"產品","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:52.653268935Z","response":"。","done":false}
{"model":"gemma","created_at":"2024-02-23T23:55:53.851367281Z","response":"","done":true,"context":[106,1645,108,235302,162470,34300,107,108,106,2516,108,235302,162470,67147,236687,235740,237945,235394,236687,237182,235581,236624,238434,64930,235365,40580,72009,240354,237945,235910,235858,236738,239534,235370,64930,235362,236380,201353,235875,137664,144620,235370,236726,235916,43693,235365,242322,236109,236434,144620,140156,235581,235990,236138,134513,235370,174916,235581,239396,239724,164328,235362,109,235302,162470,235248,201353,239602,236095,236387,43693,235365,236380,235461,236288,240129,235753,236687,238846,235581,236344,235365,235910,238626,22427,236288,240129,42575,237427,241394,236132,237427,236185,235362,242236,236500,235461,235817,236556,235370,237981,235722,235365,5275,203872,43401,235362,687,162470,19183,144620,123354,19484,235493,37476,59859,85717,235365,242236,235936,235522,236434,242449,238113,43985,235394,75692,89072,127655,74574,235362,107,108],"total_duration":180103967495,"load_duration":8947809626,"prompt_eval_count":12,"prompt_eval_duration":15742494000,"eval_count":123,"eval_duration":155412773000}
[root@centos ~]# 
```

#### c. 使用web页面/应用调用
自己开发页面或者使用开源方案，可以参考以下开源项目
- [Bionic GPT](https://github.com/bionic-gpt/bionic-gpt)
- [HTML UI](https://github.com/rtcfirefly/ollama-ui)
- [Chatbot UI](https://github.com/ivanfioravanti/chatbot-ollama)
- [Typescript UI](https://github.com/ollama-interface/Ollama-Gui?tab=readme-ov-file)
- [Minimalistic React UI for Ollama Models](https://github.com/richawo/minimal-llm-ui)
- [Web UI](https://github.com/ollama-webui/ollama-webui)
- [Ollamac](https://github.com/kevinhermawan/Ollamac)
- [big-AGI](https://github.com/enricoros/big-agi/blob/main/docs/config-ollama.md)
- [Cheshire Cat assistant framework](https://github.com/cheshire-cat-ai/core)
- [Amica](https://github.com/semperai/amica)
- [chatd](https://github.com/BruceMacD/chatd)
- [Ollama-SwiftUI](https://github.com/kghandour/Ollama-SwiftUI)

****
例如 chatbot-ollama

![img.png](./img.png)
