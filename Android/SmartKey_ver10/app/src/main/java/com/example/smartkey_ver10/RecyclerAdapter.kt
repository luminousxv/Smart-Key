package com.example.smartkey_ver10

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class RecyclerUserAdapter(private val items: ArrayList<ViewItem>
                          , private val onClick: (ViewItem) -> Unit)
    : RecyclerView.Adapter<RecyclerUserAdapter.ViewHolder>() {

    override fun getItemCount(): Int {return items.size}

    override fun onBindViewHolder(holder: RecyclerUserAdapter.ViewHolder, position: Int) {

        val item = items[position]
        val listener = View.OnClickListener {
            item.let{
                onClick(item)
            }
        }
        holder.apply {
            bind(listener, item)
            itemView.tag = item
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val inflatedView = LayoutInflater.from(parent.context).inflate(R.layout.item_view, parent, false)
        return RecyclerUserAdapter.ViewHolder(inflatedView)
    }

    // 각 항목에 필요한 기능을 구현
    class ViewHolder(v: View) : RecyclerView.ViewHolder(v) {
        private var view: View = v
        fun bind(listener: View.OnClickListener, item: ViewItem) {
            view.findViewById<TextView>(R.id.txtUser_name).text = item.name
            view.findViewById<TextView>(R.id.txtUser_id).text = item.id
            view.setOnClickListener(listener)
        }
    }
}