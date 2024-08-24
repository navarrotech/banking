// Copyright © 2024 Navarrotech

import { dataActions } from "@/modules/data";
import { dispatch } from "@/store";
import axios from "axios"

const api = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}:2000`,
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token"),
  },
  // Don't throw errors on non-2xx responses
  validateStatus: () => true,
})

api.interceptors.response.use(
  (response) => {
    const { request, status, config, data } = response
    if (status === 200) {
      // Create methods
      if (config.method === "post") {
        if (data?.id && request.responseURL.endsWith("/tags_inventory")) {
          dispatch(
            dataActions.createTagInventory(data)
          )
        }
        else if (data?.id && request.responseURL.endsWith("/auto_tag_rule")) {
          dispatch(
            dataActions.createTagRule(data)
          )
        }
        else if (data?.id && request.responseURL.endsWith("/tags")) {
          dispatch(
            dataActions.createTag(data)
          )
        }
        // else if (data?.id && request.responseURL.endsWith("/transactions")) {
        //   dispatch(
        //     dataActions.updateTransaction(data)
        //   )
        // }
      }
      // Update methods
      else if (config.method === "patch") {
        if (data?.id && request.responseURL.endsWith("/tags_inventory")) {
          dispatch(
            dataActions.updateTagInventory(data)
          )
        }
        else if (data?.id && request.responseURL.endsWith("/auto_tag_rule")) {
          dispatch(
            dataActions.updateTagRule(data)
          )
        }
        else if (data?.id && request.responseURL.endsWith("/tags")) {
          dispatch(
            dataActions.updateTag(data)
          )
        }
        else if (data?.id && request.responseURL.endsWith("/transactions")) {
          dispatch(
            dataActions.updateTransaction(data)
          )
        }
      }
      // Delete methods
      else if (config.method === "delete") {
        if (data?.id && request.responseURL.endsWith("/tags_inventory")) {
          dispatch(
            dataActions.deleteTagInventory(data)
          )
        }
        else if (data?.id && request.responseURL.endsWith("/auto_tag_rule")) {
          dispatch(
            dataActions.deleteTagRule(data)
          )
        }
        else if (data?.id && request.responseURL.endsWith("/tags")) {
          dispatch(
            dataActions.deleteTag(data)
          )
        }
        // else if (data?.id && request.responseURL.endsWith("/transactions")) {
        //   dispatch(
        //     dataActions.deleteTransaction(data)
        //   )
        // }
      }
    }
    return response
  }
)

export default api
