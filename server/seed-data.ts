import { storage } from "./storage";
import { InsertLearningContent } from "@shared/schema";

/**
 * 批量添加学习内容数据
 */
export async function seedLearningContent() {
  console.log("开始添加学习内容...");

  // 检查是否已有内容，避免重复添加
  const existingContent = await storage.getAllLearningContent();
  if (existingContent.length > 24) {
    console.log(`已存在${existingContent.length}条学习内容，跳过添加`);
    return;
  }

  // 口语练习-超市购物场景 (6项)
  const supermarketContent: InsertLearningContent[] = [
    {
      title: "超市购物基础对话",
      description: "学习在超市购物时的基础对话和常用表达",
      type: "oral",
      subtype: "supermarket",
      content: {
        dialogues: [
          {
            role: "Customer",
            english: "Excuse me, where can I find the vegetables?",
            chinese: "打扰一下，蔬菜在哪里可以找到？"
          },
          {
            role: "Staff",
            english: "The vegetables are in aisle 3, on your right.",
            chinese: "蔬菜在3号走道，在你的右边。"
          },
          {
            role: "Customer",
            english: "Thank you. And do you have fresh oranges today?",
            chinese: "谢谢。今天有新鲜的橙子吗？"
          },
          {
            role: "Staff",
            english: "Yes, we have fresh oranges. They're on sale today.",
            chinese: "是的，我们有新鲜的橙子。今天它们正在特价销售。"
          }
        ],
        vocabulary: [
          { word: "vegetable", translation: "蔬菜" },
          { word: "aisle", translation: "走道" },
          { word: "fresh", translation: "新鲜的" },
          { word: "on sale", translation: "特价" }
        ]
      },
      difficulty: "beginner",
      duration: 10
    },
    {
      title: "询问商品价格",
      description: "学习如何询问商品价格和讨价还价",
      type: "oral",
      subtype: "supermarket",
      content: {
        dialogues: [
          {
            role: "Customer",
            english: "How much are these apples?",
            chinese: "这些苹果多少钱？"
          },
          {
            role: "Seller",
            english: "They are $2.50 per pound.",
            chinese: "它们是每磅2.50美元。"
          },
          {
            role: "Customer",
            english: "That's a bit expensive. Can you give me a better price if I buy 3 pounds?",
            chinese: "有点贵。如果我买3磅，你能给我更好的价格吗？"
          },
          {
            role: "Seller",
            english: "Alright, I can make it $2.25 per pound if you buy 3 pounds.",
            chinese: "好吧，如果你买3磅，我可以每磅2.25美元。"
          }
        ],
        vocabulary: [
          { word: "pound", translation: "磅" },
          { word: "expensive", translation: "昂贵的" },
          { word: "better price", translation: "更好的价格" },
          { word: "bargain", translation: "讨价还价" }
        ]
      },
      difficulty: "beginner",
      duration: 15
    },
    {
      title: "结账付款对话",
      description: "学习在超市结账时的常用对话",
      type: "oral",
      subtype: "supermarket",
      content: {
        dialogues: [
          {
            role: "Cashier",
            english: "Did you find everything you were looking for today?",
            chinese: "今天您找到了您要找的所有东西吗？"
          },
          {
            role: "Customer",
            english: "Yes, thank you. Do you accept credit cards?",
            chinese: "是的，谢谢。你们接受信用卡吗？"
          },
          {
            role: "Cashier",
            english: "Yes, we do. Your total comes to $45.75. Would you like a bag for your groceries?",
            chinese: "是的，我们接受。您的总计是45.75美元。您需要袋子装杂货吗？"
          },
          {
            role: "Customer",
            english: "Yes, please. And can I have a receipt?",
            chinese: "是的，请给我。我可以要一张收据吗？"
          }
        ],
        vocabulary: [
          { word: "cashier", translation: "收银员" },
          { word: "credit card", translation: "信用卡" },
          { word: "total", translation: "总计" },
          { word: "receipt", translation: "收据" },
          { word: "groceries", translation: "杂货" }
        ]
      },
      difficulty: "beginner",
      duration: 10
    },
    {
      title: "寻找特定商品",
      description: "学习如何询问和寻找特定的商品",
      type: "oral",
      subtype: "supermarket",
      content: {
        dialogues: [
          {
            role: "Customer",
            english: "Excuse me, I'm looking for gluten-free bread. Do you carry that?",
            chinese: "打扰一下，我在找无麸质面包。你们有吗？"
          },
          {
            role: "Staff",
            english: "Yes, we have a special section for gluten-free products on aisle 5.",
            chinese: "是的，我们在5号走道有专门的无麸质产品区。"
          },
          {
            role: "Customer",
            english: "Great! And what about lactose-free milk?",
            chinese: "太好了！那无乳糖牛奶呢？"
          },
          {
            role: "Staff",
            english: "You'll find that in the dairy section. We have several options available.",
            chinese: "您可以在乳制品区找到。我们有几种选择。"
          }
        ],
        vocabulary: [
          { word: "gluten-free", translation: "无麸质的" },
          { word: "lactose-free", translation: "无乳糖的" },
          { word: "dairy section", translation: "乳制品区" },
          { word: "carry", translation: "经营，售卖" },
          { word: "options", translation: "选择" }
        ]
      },
      difficulty: "intermediate",
      duration: 15
    },
    {
      title: "退换商品对话",
      description: "学习如何退换商品和表达不满",
      type: "oral",
      subtype: "supermarket",
      content: {
        dialogues: [
          {
            role: "Customer",
            english: "I'd like to return this milk. It's expired although the sell-by date is tomorrow.",
            chinese: "我想退这瓶牛奶。虽然保质期到明天，但它已经过期了。"
          },
          {
            role: "Staff",
            english: "I'm very sorry about that. Would you like a refund or a replacement?",
            chinese: "对此我非常抱歉。您想要退款还是替换商品？"
          },
          {
            role: "Customer",
            english: "I'd prefer a replacement, please. And could you check if the other milk cartons are fresh?",
            chinese: "我想要一个替换品，谢谢。你能检查一下其他牛奶盒是否新鲜吗？"
          },
          {
            role: "Staff",
            english: "Of course. I'll get you a fresh one and have someone check the stock right away.",
            chinese: "当然可以。我会给您拿一个新鲜的，并立即安排人员检查库存。"
          }
        ],
        vocabulary: [
          { word: "expired", translation: "过期的" },
          { word: "sell-by date", translation: "保质期" },
          { word: "refund", translation: "退款" },
          { word: "replacement", translation: "替换品" },
          { word: "stock", translation: "库存" }
        ]
      },
      difficulty: "intermediate",
      duration: 20
    },
    {
      title: "超市特价促销",
      description: "学习如何询问和了解超市特价和促销信息",
      type: "oral",
      subtype: "supermarket",
      content: {
        dialogues: [
          {
            role: "Customer",
            english: "I saw in your flyer that you have a buy-one-get-one-free sale on cheese this week.",
            chinese: "我在你们的广告单上看到本周奶酪有买一送一的促销。"
          },
          {
            role: "Staff",
            english: "Yes, that's correct. The offer is on all packaged cheese in the refrigerated section.",
            chinese: "是的，没错。这个优惠适用于冰柜区所有包装的奶酪。"
          },
          {
            role: "Customer",
            english: "Great! And do I need a loyalty card to get the discount?",
            chinese: "太好了！我需要会员卡才能获得折扣吗？"
          },
          {
            role: "Staff",
            english: "No, the sale is available to everyone. But if you have a loyalty card, you'll earn points on your purchase.",
            chinese: "不，这个促销对所有人开放。但如果您有会员卡，您还可以在购买时赚取积分。"
          }
        ],
        vocabulary: [
          { word: "flyer", translation: "广告单" },
          { word: "buy-one-get-one-free", translation: "买一送一" },
          { word: "loyalty card", translation: "会员卡" },
          { word: "discount", translation: "折扣" },
          { word: "points", translation: "积分" }
        ]
      },
      difficulty: "intermediate",
      duration: 15
    }
  ];

  // 口语练习-朋友交谈场景 (6项)
  const friendsContent: InsertLearningContent[] = [
    {
      title: "朋友间的日常问候",
      description: "学习如何与朋友寒暄和问候",
      type: "oral",
      subtype: "daily",
      content: {
        dialogues: [
          {
            role: "Friend A",
            english: "Hey Sarah! Long time no see. How have you been?",
            chinese: "嘿，莎拉！好久不见。你近况如何？"
          },
          {
            role: "Friend B",
            english: "Hi John! I've been great, just busy with work. What about you?",
            chinese: "嗨，约翰！我一直都很好，只是工作有点忙。你呢？"
          },
          {
            role: "Friend A",
            english: "I'm doing well. Just got back from a trip to Italy. It was amazing!",
            chinese: "我很好。刚从意大利旅行回来。太棒了！"
          },
          {
            role: "Friend B",
            english: "Oh, I'm so jealous! We should catch up soon, I want to hear all about it.",
            chinese: "哦，我太羡慕了！我们应该找时间聚一聚，我想听听所有细节。"
          }
        ],
        vocabulary: [
          { word: "long time no see", translation: "好久不见" },
          { word: "catch up", translation: "叙旧，聚一聚" },
          { word: "jealous", translation: "嫉妒的，羡慕的" },
          { word: "got back", translation: "回来了" }
        ]
      },
      difficulty: "beginner",
      duration: 10
    },
    {
      title: "计划周末活动",
      description: "学习如何与朋友讨论和计划周末活动",
      type: "oral",
      subtype: "daily",
      content: {
        dialogues: [
          {
            role: "Friend A",
            english: "Do you have any plans for this weekend?",
            chinese: "这个周末有什么计划吗？"
          },
          {
            role: "Friend B",
            english: "Not really. I was thinking of just staying in and watching movies. You?",
            chinese: "没什么特别的。我想就待在家里看电影。你呢？"
          },
          {
            role: "Friend A",
            english: "I was wondering if you'd like to go hiking at the national park on Saturday?",
            chinese: "我在想你周六想不想去国家公园徒步？"
          },
          {
            role: "Friend B",
            english: "That sounds like a great idea! What time should we meet, and what should I bring?",
            chinese: "听起来是个好主意！我们应该几点见面，我需要带什么？"
          }
        ],
        vocabulary: [
          { word: "staying in", translation: "待在家里" },
          { word: "hiking", translation: "徒步旅行" },
          { word: "national park", translation: "国家公园" },
          { word: "bring", translation: "带来" }
        ]
      },
      difficulty: "beginner",
      duration: 15
    },
    {
      title: "分享生活变化",
      description: "学习如何与朋友分享生活中的变化和进展",
      type: "oral",
      subtype: "daily",
      content: {
        dialogues: [
          {
            role: "Friend A",
            english: "I've got some exciting news to share - I got promoted at work!",
            chinese: "我有一些令人兴奋的消息要分享 - 我在工作中得到了晋升！"
          },
          {
            role: "Friend B",
            english: "Congratulations! That's fantastic news. You've been working so hard for this.",
            chinese: "恭喜你！这是个好消息。你一直为此努力工作。"
          },
          {
            role: "Friend A",
            english: "Thanks! And I'm also moving to a new apartment next month.",
            chinese: "谢谢！我还要在下个月搬到一个新公寓。"
          },
          {
            role: "Friend B",
            english: "Wow, big changes! Do you need any help with the move?",
            chinese: "哇，好大的变化！搬家需要帮忙吗？"
          }
        ],
        vocabulary: [
          { word: "exciting news", translation: "令人兴奋的消息" },
          { word: "promoted", translation: "晋升" },
          { word: "congratulations", translation: "恭喜" },
          { word: "moving", translation: "搬家" },
          { word: "apartment", translation: "公寓" }
        ]
      },
      difficulty: "intermediate",
      duration: 15
    },
    {
      title: "讨论电影和娱乐",
      description: "学习如何谈论最近看过的电影和娱乐活动",
      type: "oral",
      subtype: "daily",
      content: {
        dialogues: [
          {
            role: "Friend A",
            english: "Have you seen the new superhero movie that just came out?",
            chinese: "你看过最近上映的新超级英雄电影吗？"
          },
          {
            role: "Friend B",
            english: "Not yet, but I've heard it's really good. What did you think of it?",
            chinese: "还没有，但我听说很不错。你觉得怎么样？"
          },
          {
            role: "Friend A",
            english: "I loved it! The special effects were amazing, and the story was actually very emotional.",
            chinese: "我很喜欢！特效很惊人，故事其实很感人。"
          },
          {
            role: "Friend B",
            english: "Now I definitely want to see it. Would you be up for watching it again? Maybe we could go this Friday.",
            chinese: "现在我一定要去看了。你愿意再看一次吗？也许我们可以这周五去。"
          }
        ],
        vocabulary: [
          { word: "superhero", translation: "超级英雄" },
          { word: "special effects", translation: "特效" },
          { word: "emotional", translation: "感人的" },
          { word: "up for", translation: "愿意做某事" }
        ]
      },
      difficulty: "intermediate",
      duration: 15
    },
    {
      title: "分享旅行经历",
      description: "学习如何与朋友分享旅行经历和故事",
      type: "oral",
      subtype: "daily",
      content: {
        dialogues: [
          {
            role: "Friend A",
            english: "I just got back from my trip to Japan. It was absolutely incredible!",
            chinese: "我刚从日本旅行回来。真是太棒了！"
          },
          {
            role: "Friend B",
            english: "Oh, I've always wanted to go there! What was your favorite part of the trip?",
            chinese: "哦，我一直想去那里！你旅行中最喜欢的部分是什么？"
          },
          {
            role: "Friend A",
            english: "Probably Kyoto. The temples and gardens were so peaceful and beautiful. And the food was amazing everywhere.",
            chinese: "可能是京都。寺庙和花园非常宁静美丽。而且到处的食物都很棒。"
          },
          {
            role: "Friend B",
            english: "Did you try sushi from the famous fish market? I've heard it's the best in the world.",
            chinese: "你有没有尝试著名鱼市场的寿司？我听说那是世界上最好的。"
          }
        ],
        vocabulary: [
          { word: "incredible", translation: "难以置信的" },
          { word: "temples", translation: "寺庙" },
          { word: "peaceful", translation: "宁静的" },
          { word: "fish market", translation: "鱼市场" }
        ]
      },
      difficulty: "intermediate",
      duration: 20
    },
    {
      title: "处理意见分歧",
      description: "学习如何与朋友和谐地处理意见分歧",
      type: "oral",
      subtype: "daily",
      content: {
        dialogues: [
          {
            role: "Friend A",
            english: "I don't think that restaurant is a good choice. The service was terrible last time we went.",
            chinese: "我认为那家餐厅不是个好选择。上次我们去时服务太糟糕了。"
          },
          {
            role: "Friend B",
            english: "Really? I've always had good experiences there. But I respect your opinion.",
            chinese: "真的吗？我在那里的经历一直不错。但我尊重你的意见。"
          },
          {
            role: "Friend A",
            english: "Maybe they were just having an off day. I'm willing to give it another try if you really like it.",
            chinese: "也许他们只是那天状态不好。如果你真的喜欢，我愿意再试一次。"
          },
          {
            role: "Friend B",
            english: "How about we try somewhere new instead? There's a new Italian place that just opened downtown.",
            chinese: "我们不如尝试一个新地方吧？市中心刚开了一家新的意大利餐厅。"
          }
        ],
        vocabulary: [
          { word: "terrible", translation: "糟糕的" },
          { word: "respect", translation: "尊重" },
          { word: "off day", translation: "状态不佳的一天" },
          { word: "willing", translation: "愿意的" },
          { word: "instead", translation: "替代，取而代之" }
        ]
      },
      difficulty: "advanced",
      duration: 20
    }
  ];

  // 口语练习-乘车问路场景 (6项)
  const transportContent: InsertLearningContent[] = [
    {
      title: "询问公交路线",
      description: "学习如何询问公交车路线和时间",
      type: "oral",
      subtype: "transportation",
      content: {
        dialogues: [
          {
            role: "Tourist",
            english: "Excuse me, could you tell me which bus goes to the museum?",
            chinese: "打扰一下，请问哪辆公交车去博物馆？"
          },
          {
            role: "Local",
            english: "You can take bus number 42 or 56. They both stop right in front of the museum.",
            chinese: "你可以乘坐42号或56号公交车。它们都在博物馆前面停靠。"
          },
          {
            role: "Tourist",
            english: "Do you know how often the buses run?",
            chinese: "你知道公交车多久一班吗？"
          },
          {
            role: "Local",
            english: "They usually come every 15 minutes. There's a bus stop just around the corner.",
            chinese: "它们通常每15分钟一班。拐角处就有一个公交车站。"
          }
        ],
        vocabulary: [
          { word: "bus", translation: "公交车" },
          { word: "museum", translation: "博物馆" },
          { word: "stop", translation: "停靠，车站" },
          { word: "around the corner", translation: "拐角处" }
        ]
      },
      difficulty: "beginner",
      duration: 10
    },
    {
      title: "在地铁中寻找方向",
      description: "学习如何在地铁系统中找到正确方向",
      type: "oral",
      subtype: "transportation",
      content: {
        dialogues: [
          {
            role: "Tourist",
            english: "Excuse me, is this the right platform for the train to Central Station?",
            chinese: "打扰一下，这是去中央车站的正确站台吗？"
          },
          {
            role: "Local",
            english: "No, you need to be on the opposite platform. This train goes to Riverside.",
            chinese: "不，你需要在对面的站台。这列火车去河滨区。"
          },
          {
            role: "Tourist",
            english: "Oh, I see. How do I get to the other platform?",
            chinese: "哦，明白了。我怎么去对面的站台？"
          },
          {
            role: "Local",
            english: "Go up the stairs, cross the hall, and then go down the stairs on the other side.",
            chinese: "上楼梯，穿过大厅，然后从另一侧下楼梯。"
          }
        ],
        vocabulary: [
          { word: "platform", translation: "站台" },
          { word: "opposite", translation: "对面的" },
          { word: "stairs", translation: "楼梯" },
          { word: "cross", translation: "穿过" }
        ]
      },
      difficulty: "beginner",
      duration: 15
    },
    {
      title: "打出租车",
      description: "学习如何打出租车并告知目的地",
      type: "oral",
      subtype: "transportation",
      content: {
        dialogues: [
          {
            role: "Passenger",
            english: "Taxi! Are you available?",
            chinese: "出租车！你有空吗？"
          },
          {
            role: "Driver",
            english: "Yes, where would you like to go?",
            chinese: "是的，您想去哪里？"
          },
          {
            role: "Passenger",
            english: "I need to go to the Grand Hotel on Main Street, please. How much will it cost approximately?",
            chinese: "请带我去大街上的大酒店。大约需要多少钱？"
          },
          {
            role: "Driver",
            english: "That should be around $25, depending on traffic. Do you have a preference for which route we take?",
            chinese: "根据交通情况，大约需要25美元。您对我们走哪条路线有偏好吗？"
          }
        ],
        vocabulary: [
          { word: "taxi", translation: "出租车" },
          { word: "available", translation: "有空的" },
          { word: "approximately", translation: "大约" },
          { word: "traffic", translation: "交通" },
          { word: "route", translation: "路线" }
        ]
      },
      difficulty: "intermediate",
      duration: 15
    },
    {
      title: "询问方向到著名景点",
      description: "学习如何询问到达著名景点的方向",
      type: "oral",
      subtype: "transportation",
      content: {
        dialogues: [
          {
            role: "Tourist",
            english: "Excuse me, could you tell me how to get to the Statue of Liberty?",
            chinese: "打扰一下，您能告诉我如何去自由女神像吗？"
          },
          {
            role: "Local",
            english: "You'll need to take the ferry from Battery Park. It's about a 15-minute ride.",
            chinese: "你需要从电池公园乘坐渡轮。大约15分钟的车程。"
          },
          {
            role: "Tourist",
            english: "Is it walking distance from here?",
            chinese: "从这里步行可以到达吗？"
          },
          {
            role: "Local",
            english: "It's quite far. I'd recommend taking the subway to South Ferry station, then it's just a short walk to the ferry terminal.",
            chinese: "相当远。我建议乘坐地铁到南渡口站，然后步行一小段距离到渡轮码头。"
          }
        ],
        vocabulary: [
          { word: "ferry", translation: "渡轮" },
          { word: "statue", translation: "雕像" },
          { word: "walking distance", translation: "步行距离" },
          { word: "terminal", translation: "码头，终点站" }
        ]
      },
      difficulty: "intermediate",
      duration: 15
    },
    {
      title: "处理交通延误",
      description: "学习如何应对交通延误和改变计划",
      type: "oral",
      subtype: "transportation",
      content: {
        dialogues: [
          {
            role: "Passenger",
            english: "Excuse me, I heard there's a delay on the blue line. Is that true?",
            chinese: "打扰一下，我听说蓝线有延误。是真的吗？"
          },
          {
            role: "Staff",
            english: "Yes, there's a 30-minute delay due to signal problems. We apologize for the inconvenience.",
            chinese: "是的，由于信号问题，有30分钟的延误。我们为带来的不便道歉。"
          },
          {
            role: "Passenger",
            english: "Is there an alternative way to get to downtown?",
            chinese: "有其他方式到达市中心吗？"
          },
          {
            role: "Staff",
            english: "You can take the express bus from outside the station. It runs every 10 minutes and will get you there almost as quickly.",
            chinese: "你可以从车站外乘坐快速巴士。它每10分钟一班，几乎可以同样快地到达那里。"
          }
        ],
        vocabulary: [
          { word: "delay", translation: "延误" },
          { word: "signal problems", translation: "信号问题" },
          { word: "apologize", translation: "道歉" },
          { word: "inconvenience", translation: "不便" },
          { word: "alternative", translation: "替代方案" },
          { word: "express", translation: "快速的" }
        ]
      },
      difficulty: "intermediate",
      duration: 15
    },
    {
      title: "租车对话",
      description: "学习如何租车和了解相关细节",
      type: "oral",
      subtype: "transportation",
      content: {
        dialogues: [
          {
            role: "Customer",
            english: "Hello, I'd like to rent a car for a week starting tomorrow.",
            chinese: "你好，我想从明天开始租一辆车一周。"
          },
          {
            role: "Agent",
            english: "Certainly. What type of vehicle are you interested in?",
            chinese: "当然。您对哪种类型的车辆感兴趣？"
          },
          {
            role: "Customer",
            english: "I need a mid-size SUV. Do I need to pay a security deposit?",
            chinese: "我需要一辆中型SUV。我需要支付安全押金吗？"
          },
          {
            role: "Agent",
            english: "Yes, there's a $300 deposit which is refundable when you return the car in good condition. Would you like to add insurance coverage?",
            chinese: "是的，有300美元的押金，当您将车辆完好无损地归还时可以退还。您想添加保险吗？"
          }
        ],
        vocabulary: [
          { word: "rent", translation: "租" },
          { word: "vehicle", translation: "车辆" },
          { word: "mid-size", translation: "中型的" },
          { word: "deposit", translation: "押金" },
          { word: "refundable", translation: "可退还的" },
          { word: "insurance coverage", translation: "保险覆盖" }
        ]
      },
      difficulty: "advanced",
      duration: 20
    }
  ];

  // 口语练习-其他日常情景场景 (6项)
  const otherContent: InsertLearningContent[] = [
    {
      title: "医院就诊对话",
      description: "学习在医院就诊时的常用对话",
      type: "oral",
      subtype: "hospital",
      content: {
        dialogues: [
          {
            role: "Patient",
            english: "Good morning. I have an appointment with Dr. Johnson at 10 AM.",
            chinese: "早上好。我今天上午10点与约翰逊医生有预约。"
          },
          {
            role: "Receptionist",
            english: "Good morning. May I have your name, please?",
            chinese: "早上好。请问您的名字是？"
          },
          {
            role: "Patient",
            english: "My name is Robert Smith. I'm here for a follow-up visit.",
            chinese: "我的名字是罗伯特·史密斯。我是来进行复诊的。"
          },
          {
            role: "Receptionist",
            english: "Thank you, Mr. Smith. Please take a seat in the waiting area. The doctor will see you shortly.",
            chinese: "谢谢，史密斯先生。请在等候区就座。医生很快就会见您。"
          }
        ],
        vocabulary: [
          { word: "appointment", translation: "预约" },
          { word: "follow-up visit", translation: "复诊" },
          { word: "waiting area", translation: "等候区" },
          { word: "shortly", translation: "很快" }
        ]
      },
      difficulty: "beginner",
      duration: 15
    },
    {
      title: "餐厅点餐对话",
      description: "学习如何在餐厅点餐和付款",
      type: "oral",
      subtype: "restaurant",
      content: {
        dialogues: [
          {
            role: "Customer",
            english: "Could we have a table for two, please?",
            chinese: "请问有两人的餐桌吗？"
          },
          {
            role: "Waiter",
            english: "Certainly. Would you prefer a table near the window?",
            chinese: "当然。您是否喜欢靠窗的位置？"
          },
          {
            role: "Customer",
            english: "Yes, that would be nice. Could we see the menu, please?",
            chinese: "是的，那太好了。请问能看一下菜单吗？"
          },
          {
            role: "Waiter",
            english: "Here you are. Today's special is grilled salmon with seasonal vegetables. Would you like to order some drinks first?",
            chinese: "给您。今日特餐是烤三文鱼配时令蔬菜。您想先点些饮料吗？"
          }
        ],
        vocabulary: [
          { word: "table for two", translation: "两人餐桌" },
          { word: "near the window", translation: "靠窗" },
          { word: "menu", translation: "菜单" },
          { word: "today's special", translation: "今日特餐" },
          { word: "grilled", translation: "烤的" },
          { word: "seasonal", translation: "时令的" }
        ]
      },
      difficulty: "beginner",
      duration: 15
    },
    {
      title: "酒店入住对话",
      description: "学习如何在酒店办理入住和询问服务",
      type: "oral",
      subtype: "other",
      content: {
        dialogues: [
          {
            role: "Guest",
            english: "Good afternoon. I have a reservation under the name Michael Brown.",
            chinese: "下午好。我有一个预订，名字是迈克尔·布朗。"
          },
          {
            role: "Receptionist",
            english: "Good afternoon, Mr. Brown. Let me check your reservation... Yes, we have a single room for three nights, is that correct?",
            chinese: "下午好，布朗先生。让我查一下您的预订...是的，我们有一个单人间预订了三晚，对吗？"
          },
          {
            role: "Guest",
            english: "That's right. Is breakfast included in the rate?",
            chinese: "是的。早餐包含在价格中吗？"
          },
          {
            role: "Receptionist",
            english: "Yes, breakfast is served in the dining room from 6:30 to 10:00 AM. Here's your key card. Your room is 305 on the third floor.",
            chinese: "是的，早餐在餐厅供应，时间是早上6:30到10:00。这是您的房卡。您的房间是三楼的305号。"
          }
        ],
        vocabulary: [
          { word: "reservation", translation: "预订" },
          { word: "single room", translation: "单人间" },
          { word: "included", translation: "包含的" },
          { word: "rate", translation: "价格" },
          { word: "key card", translation: "房卡" },
          { word: "third floor", translation: "三楼" }
        ]
      },
      difficulty: "intermediate",
      duration: 15
    },
    {
      title: "机场对话",
      description: "学习如何在机场办理登机和询问航班信息",
      type: "oral",
      subtype: "other",
      content: {
        dialogues: [
          {
            role: "Passenger",
            english: "Excuse me, I need to check in for my flight to London.",
            chinese: "打扰一下，我需要办理登机手续，我的航班是去伦敦的。"
          },
          {
            role: "Airline Staff",
            english: "Certainly. May I see your passport and booking reference, please?",
            chinese: "当然。请出示您的护照和预订参考号码，好吗？"
          },
          {
            role: "Passenger",
            english: "Here you are. Also, is it possible to get a window seat?",
            chinese: "给您。另外，可以安排靠窗的座位吗？"
          },
          {
            role: "Airline Staff",
            english: "Let me see what's available... Yes, I can assign you seat 23A, which is a window seat. Would you like to check any bags?",
            chinese: "让我看看有什么位置...是的，我可以给您安排23A座位，这是个靠窗座位。您需要托运行李吗？"
          }
        ],
        vocabulary: [
          { word: "check in", translation: "办理登机手续" },
          { word: "passport", translation: "护照" },
          { word: "booking reference", translation: "预订参考号码" },
          { word: "window seat", translation: "靠窗座位" },
          { word: "assign", translation: "分配" },
          { word: "check bags", translation: "托运行李" }
        ]
      },
      difficulty: "intermediate",
      duration: 15
    },
    {
      title: "购物中心问路",
      description: "学习如何在购物中心询问方向",
      type: "oral",
      subtype: "other",
      content: {
        dialogues: [
          {
            role: "Shopper",
            english: "Excuse me, could you tell me where the electronics section is?",
            chinese: "打扰一下，您能告诉我电子产品区在哪里吗？"
          },
          {
            role: "Staff",
            english: "The electronics section is on the second floor, next to the home appliances.",
            chinese: "电子产品区在二楼，就在家电区旁边。"
          },
          {
            role: "Shopper",
            english: "Thank you. And where can I find the restrooms?",
            chinese: "谢谢。卫生间在哪里？"
          },
          {
            role: "Staff",
            english: "The restrooms are on this floor, near the food court. Just follow the signs.",
            chinese: "卫生间在本层，靠近美食广场。跟着指示牌走就可以了。"
          }
        ],
        vocabulary: [
          { word: "electronics section", translation: "电子产品区" },
          { word: "second floor", translation: "二楼" },
          { word: "home appliances", translation: "家电" },
          { word: "restrooms", translation: "卫生间" },
          { word: "food court", translation: "美食广场" },
          { word: "signs", translation: "指示牌" }
        ]
      },
      difficulty: "beginner",
      duration: 10
    },
    {
      title: "紧急情况对话",
      description: "学习如何在紧急情况下寻求帮助",
      type: "oral",
      subtype: "other",
      content: {
        dialogues: [
          {
            role: "Caller",
            english: "Hello, I need help! There's been a car accident on Main Street near the post office.",
            chinese: "你好，我需要帮助！在邮局附近的大街上发生了一起车祸。"
          },
          {
            role: "Emergency Operator",
            english: "I understand. Is anyone injured?",
            chinese: "我明白了。有人受伤吗？"
          },
          {
            role: "Caller",
            english: "Yes, the driver appears to be unconscious, but the passenger is awake and talking.",
            chinese: "是的，司机似乎失去了意识，但乘客清醒并能说话。"
          },
          {
            role: "Emergency Operator",
            english: "Stay on the line. I'm sending an ambulance and police right away. Can you provide any first aid?",
            chinese: "请保持通话。我立即派遣救护车和警察。您能提供任何急救吗？"
          }
        ],
        vocabulary: [
          { word: "car accident", translation: "车祸" },
          { word: "post office", translation: "邮局" },
          { word: "injured", translation: "受伤的" },
          { word: "unconscious", translation: "失去意识的" },
          { word: "ambulance", translation: "救护车" },
          { word: "first aid", translation: "急救" }
        ]
      },
      difficulty: "advanced",
      duration: 15
    }
  ];

  // 配音练习内容 (3组，每组6项)
  // 首先创建动画配音内容
  const animationDubbing: InsertLearningContent[] = [
    {
      title: "经典动画片配音练习 - 简单对话",
      description: "练习为简单的动画场景配音",
      type: "oral",
      subtype: "dubbing",
      content: {
        dialogues: [
          {
            role: "Character 1",
            english: "I've never seen such a beautiful sunset!",
            chinese: "我从未见过如此美丽的日落！",
            audio: "https://example.com/audio/animation1.mp3"
          },
          {
            role: "Character 2",
            english: "Me neither. This place is magical!",
            chinese: "我也是。这个地方真是神奇！",
            audio: "https://example.com/audio/animation2.mp3"
          }
        ],
        videoUrl: "https://example.com/videos/animation_scene1.mp4",
        difficulty: "beginner"
      },
      difficulty: "beginner",
      duration: 10
    }
  ];

  // 创建电影片段配音内容
  const movieDubbing: InsertLearningContent[] = [
    {
      title: "经典电影场景配音 - 励志演讲",
      description: "练习为经典电影中的励志演讲配音",
      type: "oral",
      subtype: "dubbing",
      content: {
        dialogues: [
          {
            role: "Main Character",
            english: "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward. That's how winning is done!",
            chinese: "这不是关于你打得多重，而是关于你能承受多少打击并继续前进。这就是胜利的方式！",
            audio: "https://example.com/audio/movie_speech1.mp3"
          }
        ],
        videoUrl: "https://example.com/videos/movie_scene1.mp4",
        difficulty: "intermediate"
      },
      difficulty: "intermediate",
      duration: 15
    }
  ];

  // 创建情景对话配音内容
  const scenarioDubbing: InsertLearningContent[] = [
    {
      title: "生活情景配音 - 餐厅点餐",
      description: "练习日常生活中餐厅点餐场景的对话配音",
      type: "oral",
      subtype: "dubbing",
      content: {
        dialogues: [
          {
            role: "Customer",
            english: "I'd like to order the special of the day, please. Is it spicy?",
            chinese: "我想点今日特餐，谢谢。它辣吗？",
            audio: "https://example.com/audio/restaurant1.mp3"
          },
          {
            role: "Waiter",
            english: "It's mildly spicy, but we can adjust it to your preference. Would you like it less spicy?",
            chinese: "它有一点辣，但我们可以根据您的喜好调整。您想要少一点辣吗？",
            audio: "https://example.com/audio/restaurant2.mp3"
          }
        ],
        videoUrl: "https://example.com/videos/restaurant_scene.mp4",
        difficulty: "beginner"
      },
      difficulty: "beginner",
      duration: 10
    }
  ];

  // 合并所有内容
  const allContent = [
    ...supermarketContent,
    ...friendsContent,
    ...transportContent,
    ...otherContent,
    ...animationDubbing,
    ...movieDubbing,
    ...scenarioDubbing
  ];

  // 批量添加到数据库
  console.log(`准备添加${allContent.length}条学习内容...`);
  for (const content of allContent) {
    try {
      await storage.createLearningContent(content);
      console.log(`已添加: ${content.title}`);
    } catch (error) {
      console.error(`添加失败: ${content.title}`, error);
    }
  }

  console.log("学习内容添加完成！");
}