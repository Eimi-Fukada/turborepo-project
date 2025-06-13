import { get } from "@/utils/request";

async function fetchUserList() {
  try {
    const res = await get<User[]>("/users", {
      params: {
        page: 1,
        pageSize: 20,
      },
    });
    console.log(res.data); // 返回的是 User[] 类型的数据
  } catch (err) {
    // 可选 catch 处理
  }
}

import { post } from "@/utils/request";

async function createUser() {
  try {
    const res = await post<User>("/users", {
      name: "Tom",
      age: 28,
    });
    console.log(res.data); // 新增用户返回的数据
  } catch (err) {}
}


put<T>("/users", { params: { id: 123 } });


del<T>("/users", { params: { id: 123 } });

useEffect(() => {
    setHeaderGetter(() => {
      const token = localStorage.getItem("token");
      const lang = localStorage.getItem("lang") || "zh-CN";
      return {
        Authorization: token ? `Bearer ${token}` : "",
        "Accept-Language": lang,
      };
    });
  }, []);注册